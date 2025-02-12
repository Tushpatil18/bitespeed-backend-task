import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

router.post("/identify", async (req: Request, res: Response) => {
  const { email, phoneNumber } = req.body;

  if (!email && !phoneNumber) {
    return res.status(400).json({ error: "Email or Phone Number required" });
  }

  try {
    // Find existing contacts with the same email or phone number
    const existingContacts = await prisma.contact.findMany({
      where: {
        OR: [{ email }, { phoneNumber }],
      },
    });

    console.log("Existing Contacts:", existingContacts);

    if (existingContacts.length === 0) {
      // No existing contact found, create a new primary contact
      const newContact = await prisma.contact.create({
        data: {
          email,
          phoneNumber,
          linkPrecedence: "primary",
        },
      });

      return res.json({
        contact: {
          primaryContactId: newContact.id,
          emails: newContact.email ? [newContact.email] : [],
          phoneNumbers: newContact.phoneNumber ? [newContact.phoneNumber] : [],
          secondaryContactIds: [],
          newSecondaryContactCreated: false,
        },
      });
    }

    // Find the primary contact (first contact found with linkPrecedence "primary")
    let primaryContact = existingContacts.find((c) => c.linkPrecedence === "primary") || existingContacts[0];

    console.log("Primary Contact:", primaryContact);

    // Collect all related contacts (secondary contacts linked to the primary contact)
    const relatedContacts = await prisma.contact.findMany({
      where: { linkedId: primaryContact.id },
    });

    console.log("Related Contacts:", relatedContacts);

    // Extract emails and phone numbers (unique values)
    const emails = new Set([primaryContact.email, ...existingContacts.map((c) => c.email), ...relatedContacts.map((c) => c.email)].filter(Boolean));
    const phoneNumbers = new Set([primaryContact.phoneNumber, ...existingContacts.map((c) => c.phoneNumber), ...relatedContacts.map((c) => c.phoneNumber)].filter(Boolean));

    // Check if the secondary contact already exists
    const existingSecondaryContact = existingContacts.find(
      (c) => c.email === email && c.phoneNumber === phoneNumber
    );

    if (!existingSecondaryContact) {
      // Create a new secondary contact if it doesn't exist
      const newSecondaryContact = await prisma.contact.create({
        data: {
          email,
          phoneNumber,
          linkedId: primaryContact.id, // Link to the primary contact
          linkPrecedence: "secondary",
        },
      });

      console.log("New Secondary Contact Created:", newSecondaryContact);

      // Add the newly created secondary contact to the related contacts array
      relatedContacts.push(newSecondaryContact);
    }

    return res.json({
      contact: {
        primaryContactId: primaryContact.id,
        emails: Array.from(emails),
        phoneNumbers: Array.from(phoneNumbers),
        secondaryContactIds: relatedContacts.map((c) => c.id),
        newSecondaryContactCreated: !existingSecondaryContact, // Only true if a new secondary contact was created
      },
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;