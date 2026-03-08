class TrieNode:
    def __init__(self):
        self.children = {}
        self.is_end_of_word = False


class Trie:
    """Prefix Tree implementation for efficient string storage and
    retrieval."""

    def __init__(self):
        self.root = TrieNode()

    def insert(self, word: str) -> None:
        pass

    def search(self, word: str) -> bool:
        pass

    def startsWith(self, prefix: str) -> bool:
        pass
