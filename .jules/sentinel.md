## 2023-11-20 - [Fix weak PRNG in random password generator]
**Vulnerability:** `Math.random()` was being used to generate passwords in `gerarSenhaAleatoria`. `Math.random()` is not cryptographically secure and the resulting passwords could theoretically be predicted.
**Learning:** This function is used to generate temporary passwords during setup/recovery processes. It's critical to use secure random number generators for these operations to prevent attacks against the authentication flow.
**Prevention:** Always use `crypto.getRandomValues()` instead of `Math.random()` for any cryptography-related random generation, like IDs, secrets, or passwords.
