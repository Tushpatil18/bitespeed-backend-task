# Identity Reconciliation Service

## Overview

This project implements a web service designed to consolidate customer contact information across multiple purchases. By integrating with FluxKart.com, the service identifies and links different orders made with varying contact details to the same individual. This ensures a personalized customer experience and rewards loyal customers effectively.

## Features

- **Contact Identification**: Receives HTTP POST requests containing either an email or a phone number.
- **Data Consolidation**: Links multiple contact records associated with the same individual.
- **Primary and Secondary Contacts**: Designates the first contact as primary and subsequent ones as secondary.
- **Response Structure**: Returns a JSON payload with the consolidated contact information.

## How It Works

The web service exposes an endpoint at `/bitespeed/identity-reconsiliation/identify` to receive HTTP POST requests with JSON bodies. The JSON body should contain either an `email` or a `phoneNumber` (or both) for identification. The service then performs the identity reconciliation and returns a JSON payload containing the consolidated contact information.

## API Endpoint

POST /api/identify

### Example Request:

```json
{
    "email": "lorraine@hillvalley.edu",
    "phoneNumber": "1234567890"
}
```

### Example Response:

```json
{
 "contact": {
        "primaryContactId": 1,
        "emails": ["mcfly@hillvalley.edu", "lorraine@hillvalley.edu", "george@hillvalley.edu"],
        "phoneNumbers": ["1234567890"],
        "secondaryContactIds": [2, 3]
    }
}
```
