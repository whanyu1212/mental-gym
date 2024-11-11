from collections import deque


class ReceiptManager:
    def __init__(self):
        # Dictionary to store receipts by ISO code
        self.receipts = {}
        # Queue for delegation leaders
        self.queue = deque()
        # Mapping of country names to ISO codes
        self.country_codes = {
            "Indonesia": "IDN",
            "Sri Lanka": "SRI",
            "Slovenia": "SVN",
            "Serbia": "SER",
            "South Africa": "RSA",
            "India": "IND",
            "Sweden": "SWE",
            "Singapore": "SGP",
            "Slovakia": "SVK",
            # Add other countries...
        }

    def add_to_queue(self, country_name):
        self.queue.append(country_name)

    def process_payment(self):
        if not self.queue:
            return None

        country_name = self.queue.popleft()
        iso_code = self.country_codes.get(country_name)
        if iso_code:
            receipt = {
                "country_name": country_name,
                "iso_code": iso_code,
                "status": "paid",
            }
            self.receipts[iso_code] = receipt
            return receipt
        return None

    def get_receipt(self, country_name):
        iso_code = self.country_codes.get(country_name)
        return self.receipts.get(iso_code)


# example usage
if __name__ == "__main__":
    manager = ReceiptManager()
    manager.add_to_queue("Singapore")
    manager.add_to_queue("India")
    manager.add_to_queue("Sri Lanka")
    manager.add_to_queue("Sweden")

    print(manager.process_payment())  # Should print receipt for Singapore
    print(manager.process_payment())  # Should print receipt for India
