def gcd(a, b):
    """Euclidean algorithm for Greatest Common Divisor."""
    while b:
        a, b = b, a % b
    return a


def sieve_of_eratosthenes(n):
    """Generates primes up to n."""
    primes = [True] * (n + 1)
    primes[0] = primes[1] = False

    for i in range(2, int(n**0.5) + 1):
        if primes[i]:
            for j in range(i * i, n + 1, i):
                primes[j] = False

    return [i for i, is_prime in enumerate(primes) if is_prime]
