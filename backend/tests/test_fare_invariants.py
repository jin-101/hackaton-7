import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))

from hypothesis import given, settings, strategies as st
from app.services.fare_service import validate_tier_prices


@given(
    prestige=st.integers(min_value=1, max_value=10_000_000),
    economy_full=st.integers(min_value=1, max_value=10_000_000),
    economy_discount=st.integers(min_value=1, max_value=10_000_000),
    economy_special=st.integers(min_value=1, max_value=10_000_000),
)
@settings(max_examples=500)
def test_valid_prices_pass_validation(prestige, economy_full, economy_discount, economy_special):
    """Valid price combinations must always pass validation (BR-01, BR-04, BR-08)."""
    if (
        prestige >= economy_full * 1.5
        and economy_full > economy_discount > economy_special
        and all(p > 0 for p in [prestige, economy_full, economy_discount, economy_special])
    ):
        assert validate_tier_prices(prestige, economy_full, economy_discount, economy_special)


@given(price=st.integers(max_value=0))
def test_zero_or_negative_price_fails(price):
    """BR-04: Zero or negative fares must always fail validation."""
    assert not validate_tier_prices(price, 50_000, 40_000, 30_000)
    assert not validate_tier_prices(100_000, price, 40_000, 30_000)
    assert not validate_tier_prices(100_000, 50_000, price, 30_000)
    assert not validate_tier_prices(100_000, 50_000, 40_000, price)


@given(
    economy_full=st.integers(min_value=1, max_value=10_000_000),
)
def test_prestige_must_be_at_least_1_5x_economy_full(economy_full):
    """BR-08: Prestige price must be >= 1.5x economy_full."""
    too_low_prestige = max(1, economy_full - 1)
    if too_low_prestige < economy_full * 1.5:
        discount = max(1, economy_full - 10_000)
        special = max(1, discount - 10_000)
        if discount > 0 and special > 0 and economy_full > discount > special:
            assert not validate_tier_prices(too_low_prestige, economy_full, discount, special)


@given(
    base=st.integers(min_value=10_000, max_value=1_000_000),
)
def test_economy_class_ordering_enforced(base):
    """BR-01: economy_full > economy_discount > economy_special must hold."""
    economy_full = base
    economy_discount = base
    economy_special = max(1, base - 1)
    prestige = round(base * 2)
    assert not validate_tier_prices(prestige, economy_full, economy_discount, economy_special)

    economy_full2 = base
    economy_discount2 = base + 1
    economy_special2 = base - 1
    prestige2 = round(base * 2)
    assert not validate_tier_prices(prestige2, economy_full2, economy_discount2, economy_special2)
