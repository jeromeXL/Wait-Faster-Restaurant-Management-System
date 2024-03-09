import re

tablePattern = r'^Table\d+$'

def matchesTablePattern(username: str) -> bool:
    return re.match(tablePattern, username) is not None

if __name__ == "__main__":
    print(matchesTablePattern("TableOne"))