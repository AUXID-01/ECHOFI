# tests/test_bank_service.py

import pytest
from internal.services.bank_service import BankService, InsufficientFundsError
from internal.database.models import Account
from pkg.utils.security import get_password_hash

# The fixtures (db_session, setup_user_and_account, mock_transfer_request) 
# are automatically found from conftest.py

def test_get_account_balance_success(db_session, setup_user_and_account):
    """Tests successful retrieval of account balance."""
    user, account = setup_user_and_account
    service = BankService(db_session)
    
    balance_info = service.get_account_balance(user.id)
    
    assert balance_info is not None
    assert balance_info.balance == 500.00
    assert balance_info.account_number == account.account_number

def test_initiate_transfer_insufficient_funds(db_session, setup_user_and_account, mock_transfer_request):
    """Tests failure when initiating a transfer with insufficient funds."""
    user, account = setup_user_and_account
    service = BankService(db_session)
    
    # Try to transfer more than the balance (500.00)
    mock_transfer_request.amount = 1000.00 
    mock_transfer_request.source_account = account.account_number
    
    with pytest.raises(InsufficientFundsError):
        service.initiate_transfer(user.id, mock_transfer_request)

def test_initiate_and_execute_transfer_success(db_session, setup_user_and_account, mock_transfer_request, mocker):
    """Tests the full atomic transfer flow."""
    user, account = setup_user_and_account
    service = BankService(db_session)

    initial_balance = account.balance # 500.00
    transfer_amount = 100.00
    mock_transfer_request.amount = transfer_amount
    mock_transfer_request.source_account = account.account_number
    
    # 1. Initiate Transfer
    transfer_id = service.initiate_transfer(user.id, mock_transfer_request)
    assert transfer_id is not None
    
    # 2. Execute Transfer (using the hardcoded mock success token)
    result = service.execute_transfer(user.id, "Test payment", "MOCK_OTP_SUCCESS")
    
    assert "executed successfully" in result
    
    # 3. Verify New Balance
    new_account = db_session.get(Account, account.id)
    expected_balance = initial_balance - transfer_amount
    
    assert new_account.balance == expected_balance # Should be 400.00
    
    # 4. Verify History Log
    history = service.get_transaction_history(user.id)
    assert len(history) == 2 # Pending log, then Completed log
    assert history[0].status == "completed"

def test_execute_transfer_invalid_otp(db_session, setup_user_and_account, mock_transfer_request):
    """Tests failure when executing a transfer with an invalid OTP."""
    user, account = setup_user_and_account
    service = BankService(db_session)
    
    service.initiate_transfer(user.id, mock_transfer_request)
    
    with pytest.raises(ValueError, match="OTP/Transfer token is invalid"):
        # Invalid OTP token
        service.execute_transfer(user.id, "Test payment", "INVALID_TOKEN")# tests/test_bank_service.py

import pytest
from internal.services.bank_service import BankService, InsufficientFundsError

# The fixtures (db_session, setup_user_and_account, mock_transfer_request) 
# are automatically found from conftest.py

def test_get_account_balance_success(db_session, setup_user_and_account):
    """Tests successful retrieval of account balance."""
    user, account = setup_user_and_account
    service = BankService(db_session)
    
    balance_info = service.get_account_balance(user.id)
    
    assert balance_info is not None
    assert balance_info.balance == 500.00
    assert balance_info.account_number == account.account_number

def test_initiate_transfer_insufficient_funds(db_session, setup_user_and_account, mock_transfer_request):
    """Tests failure when initiating a transfer with insufficient funds."""
    user, account = setup_user_and_account
    service = BankService(db_session)
    
    # Try to transfer more than the balance (500.00)
    mock_transfer_request.amount = 1000.00 
    mock_transfer_request.source_account = account.account_number
    
    with pytest.raises(InsufficientFundsError):
        service.initiate_transfer(user.id, mock_transfer_request)

def test_initiate_and_execute_transfer_success(db_session, setup_user_and_account, mock_transfer_request, mocker):
    """Tests the full atomic transfer flow."""
    user, account = setup_user_and_account
    service = BankService(db_session)

    initial_balance = account.balance # 500.00
    transfer_amount = 100.00
    mock_transfer_request.amount = transfer_amount
    mock_transfer_request.source_account = account.account_number
    
    # 1. Initiate Transfer
    transfer_id = service.initiate_transfer(user.id, mock_transfer_request)
    assert transfer_id is not None
    
    # 2. Execute Transfer (using the hardcoded mock success token)
    result = service.execute_transfer(user.id, "Test payment", "MOCK_OTP_SUCCESS")
    
    assert "executed successfully" in result
    
    # 3. Verify New Balance
    new_account = db_session.get(Account, account.id)
    expected_balance = initial_balance - transfer_amount
    
    assert new_account.balance == expected_balance # Should be 400.00
    
    # 4. Verify History Log
    history = service.get_transaction_history(user.id)
    assert len(history) == 2 # Pending log, then Completed log
    assert history[0].status == "completed"

def test_execute_transfer_invalid_otp(db_session, setup_user_and_account, mock_transfer_request):
    """Tests failure when executing a transfer with an invalid OTP."""
    user, account = setup_user_and_account
    service = BankService(db_session)
    
    service.initiate_transfer(user.id, mock_transfer_request)
    
    with pytest.raises(ValueError, match="OTP/Transfer token is invalid"):
        # Invalid OTP token
        service.execute_transfer(user.id, "Test payment", "INVALID_TOKEN")