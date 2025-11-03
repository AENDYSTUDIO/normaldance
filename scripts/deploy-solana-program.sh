#!/bin/bash

# Script to deploy the deflationary model Solana program

# Check if solana CLI is installed
if ! command -v solana &> /dev/null
then
    echo "Solana CLI is not installed. Please install it first."
    exit 1
fi

# Check if we're in the correct directory
if [ ! -f "Cargo.toml" ]; then
    echo "Please run this script from the project root directory"
    exit 1
fi

echo "Building the deflationary model Solana program..."

# Build the program
cd programs/deflationary-model
cargo build-bpf

# Check if build was successful
if [ $? -ne 0 ]; then
    echo "Build failed"
    exit 1
fi

echo "Deploying the program to Solana devnet..."

# Deploy to devnet
solana config set --url devnet
solana program deploy target/deploy/deflationary_model.so

if [ $? -ne 0 ]; then
    echo "Deployment failed"
    exit 1
fi

echo "Program deployed successfully!"

# Get the program ID
PROGRAM_ID=$(solana address)
echo "Program ID: $PROGRAM_ID"

# Save the program ID to a file
echo "$PROGRAM_ID" > program_id.txt
echo "Program ID saved to program_id.txt"

cd ../..