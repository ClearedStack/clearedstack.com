// Package itemid checks an item identifier against Muster's contract v1
// ("Identifiers"): PA- and then four digits, or five to nine digits with no
// leading zero.
package itemid

// Valid reports whether s is exactly one item identifier.
func Valid(s string) bool {
	if len(s) < 7 || len(s) > 12 || s[:3] != "PA-" {
		return false
	}
	digits := s[3:]
	for i := 0; i < len(digits); i++ {
		if digits[i] < '0' || digits[i] > '9' {
			return false
		}
	}
	return len(digits) == 4 || digits[0] != '0'
}
