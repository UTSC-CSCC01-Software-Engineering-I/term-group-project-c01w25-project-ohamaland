from unittest.mock import patch
from django.test import TestCase
from datetime import date, timedelta, datetime
from dateutil.relativedelta import relativedelta
from api.signals import get_spending_periods, get_all_dates_in_period


class SpendingPeriodTests(TestCase):
    @patch("django.utils.timezone.now")
    def test_get_spending_periods(self, mock_now):
        """Test the get_spending_periods function."""
        mock_now.return_value = datetime(2025, 3, 20)  # fixed datetime

        today = mock_now.return_value.date()
        periods = get_spending_periods()

        expected_weekly_start = today - timedelta(days=7)
        expected_monthly_start = today - relativedelta(months=1)
        expected_quarterly_start = today.replace(
            month=((today.month - 1) // 3) * 3 + 1, day=1
        )
        expected_yearly_start = today - relativedelta(years=1)

        self.assertEqual(periods["Weekly"], expected_weekly_start)
        self.assertEqual(periods["Monthly"], expected_monthly_start)
        self.assertEqual(periods["Quarterly"], expected_quarterly_start)
        self.assertEqual(periods["Yearly"], expected_yearly_start)

    def test_get_all_dates_in_period(self):
        """Test get_all_dates_in_period function."""
        start_date = date(2025, 3, 1)
        end_date = date(2025, 3, 5)

        expected_dates = [
            date(2025, 3, 1),
            date(2025, 3, 2),
            date(2025, 3, 3),
            date(2025, 3, 4),
            date(2025, 3, 5),
        ]

        result = get_all_dates_in_period(start_date, end_date)
        self.assertEqual(result, expected_dates)
