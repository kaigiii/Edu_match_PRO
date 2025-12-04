with open("agent_fields.txt", "r", encoding="utf-16") as f:
    for line in f:
        if "prompt" in line.lower() or "instruction" in line.lower():
            print(line.strip())
