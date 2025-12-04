with open("agent_fields.txt", "r", encoding="utf-16") as f:
    for i in range(50):
        line = f.readline()
        if not line:
            break
        print(line.strip())
