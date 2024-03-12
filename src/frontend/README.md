
# WaitFaster Frontend

## Getting Started

This guide assumes that you have a basic understanding of JavaScript and React development environments.

### Prerequisites

- Ensure you have [Node.js](https://nodejs.org/) installed (version 14.x or higher is recommended).
- npm (Node Package Manager), which comes with Node.js.

### Setup

1. Clone the repository to your local machine.

2. Navigate to the frontend directory:

cd path/to/capstone-project-3900h18a_waitfaster/src/frontend

3. Install dependencies using npm:

npm install

### Running the Application

To start the development server, run:

npm run dev

This will start the Vite development server. By default, the frontend will be available at [http://localhost:3000](http://localhost:3000).

### Building for Production

To build the application for production, run:

npm run build

This will create a `dist` folder in your project directory, containing all the files needed to deploy the application.

## Package Management

Package management is done with npm. The `package.json` file in the root of the frontend directory specifies all the dependencies.

### Adding a Package

To add a new package, run:

npm install <package-name>

Be sure to commit the updated `package.json` and `package-lock.json` files.

## Configuration

Use the `.env` file for environment variables (e.g., API endpoints). There is an `.env.example` file to be copied and renamed to `.env` for your local setup.
