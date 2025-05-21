# match-analyser
The project includes a place to upload txt files to be analysed, the result is then saved in a json on the server to be loaded in the frontend to see the stats for the match.


Getting Started

This project consists of two parts:

    Client: React frontend

    Server: Node.js backend

Prerequisites

Make sure you have Node.js and npm installed on your machine.
Installation

You need to install dependencies separately for both client and server.
Client

cd client
npm install

Server

cd server
npm install

Running the Application
Start the Server

cd server
node ./index.js

The server will start running on its configured port (usually http://localhost:5000).
Start the Client

cd client
npm run dev

The client will start in development mode, typically at http://localhost:5173.
Project Structure

root
├── client     # React frontend code
└── server     # Node.js backend code
    └── matches  # Analyzed matches are saved here as JSON files

Notes

    Make sure the server is running before starting the client to enable API communication.

    Analyzed matches are saved as JSON files inside the server/matches directory.


![billede](https://github.com/user-attachments/assets/8fd70238-5e1f-47d5-ad16-1960756abb03)
