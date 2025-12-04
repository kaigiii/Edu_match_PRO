import requests
import sys
import uuid

API_URL = "http://127.0.0.1:8000/agent/query"

def main():
    print("Welcome to the Taiwan Rural Education Impact Agent CLI!")
    print("Type 'exit' or 'quit' to stop.")
    print("-" * 50)

    session_id = str(uuid.uuid4())
    print(f"Session ID: {session_id}")

    while True:
        try:
            user_input = input("\nYou: ")
            if user_input.lower() in ["exit", "quit"]:
                print("Goodbye!")
                break
            
            if not user_input.strip():
                continue

            print("Agent is thinking...", end="\r")
            
            try:
                response = requests.post(API_URL, json={"query": user_input, "session_id": session_id})
                response.raise_for_status()
                data = response.json()
                agent_response = data.get("response", "No response received.")
                
                print(f"\nAgent: {agent_response}")
                
            except requests.exceptions.ConnectionError:
                print("\nError: Could not connect to the server. Is it running?")
            except Exception as e:
                print(f"\nError: {e}")

        except KeyboardInterrupt:
            print("\nGoodbye!")
            break

if __name__ == "__main__":
    main()
