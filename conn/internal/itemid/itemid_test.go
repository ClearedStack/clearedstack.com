package itemid

import (
	"regexp"
	"testing"
)

// contract is Muster's contract/v1/CONTRACT.md, "Identifiers".
var contract = regexp.MustCompile(`^PA-([0-9]{4}|[1-9][0-9]{4,8})$`)

func TestValid(t *testing.T) {
	good := []string{"PA-0001", "PA-0417", "PA-9999", "PA-10000", "PA-99999", "PA-123456789"}
	bad := []string{
		"", "PA-", "PA-1", "PA-001", "PA-00001", "PA-010000", "PA-1234567890",
		"pa-0001", "PA-0001 ", " PA-0001", "PA-0001\n", "EP-0001", "PA-00a1",
		"PA-0001/", "PA-٠٠٠١", "PA--001", "../PA-0001",
	}
	for _, s := range good {
		if !Valid(s) {
			t.Errorf("Valid(%q) = false, want true", s)
		}
	}
	for _, s := range bad {
		if Valid(s) {
			t.Errorf("Valid(%q) = true, want false", s)
		}
	}
}

func FuzzValid(f *testing.F) {
	for _, s := range []string{"PA-0001", "PA-10000", "PA-00001", "", "PA-0001\n", "PA-٠٠٠١"} {
		f.Add(s)
	}
	f.Fuzz(func(t *testing.T, s string) {
		if got, want := Valid(s), contract.MatchString(s); got != want {
			t.Fatalf("Valid(%q) = %v, contract says %v", s, got, want)
		}
	})
}
