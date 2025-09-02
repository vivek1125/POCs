import apiService from './apiService';

export interface AccountData {
  accountNumber: number;
  customerId: number;
  accountType: string;
  balance: number;
  isActive: boolean;
  status: string; // Added for consistency with Customer page
  createdOn: string;
  lastUpdated?: string; // Added for accountUpdateOn from API
  customerName?: string; // Optional, might come from account details
}

export interface NewAccount {
  customerId: number;
  initialBalance: number;
  accountType: string;
}

export interface UpdateBalanceRequest {
  newBalance: number;
}

const AccountApiService = {
  async getAllAccounts(): Promise<AccountData[]> {
    try {
      console.log('Calling API: GetAllAccounts');
      const response = await apiService.get('/api/Account/GetAllAccounts');
      console.log('API Response - GetAllAccounts:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('API Error - GetAllAccounts:', error?.response?.data || error);
      throw error;
    }
  },

  async getAccountByAccountNumber(accountNumber: number): Promise<AccountData> {
    try {
      console.log('Calling API: GetAccountByAccountNumber with accountNumber:', accountNumber);
      const response = await apiService.get(`/api/Account/GetAccountByAccountNumber?accountNumber=${accountNumber}`);
      console.log('API Response - GetAccountByAccountNumber:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('API Error - GetAccountByAccountNumber:', error?.response?.data || error);
      throw error;
    }
  },

  async getAccountDetails(accountNumberOrId: number): Promise<AccountData | AccountData[]> {
    try {
      console.log('Calling API: GetAccountDetailsByNoOrCustID with accountNumberOrId:', accountNumberOrId);
      const response = await apiService.get(`/api/Account/GetAccountDetailsByNoOrCustID?accountNumberOrId=${accountNumberOrId}`);
      console.log('API Response - GetAccountDetailsByNoOrCustID:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('API Error - GetAccountDetailsByNoOrCustID:', error?.response?.data || error);
      throw error;
    }
  },

  async createAccount(newAccount: NewAccount): Promise<AccountData> {
    try {
      const response = await apiService.post('/api/Account/CreateAccount', newAccount);
      return response.data;
    } catch (error: any) {
      console.error('API Error:', error?.response?.data || error);
      throw error;
    }
  },

  async updateBalance(accountNumber: number, updateRequest: UpdateBalanceRequest, balanceUpdateOn?: Date): Promise<AccountData> {
    try {
      console.log('Calling API: UpdateBalance with:', { accountNumber, updateRequest, balanceUpdateOn });
      const params = balanceUpdateOn ? `?balanceUpdateOn=${balanceUpdateOn.toISOString()}` : '';
      console.log('API URL will be:', `/api/Account/UpdateBalance?accountNumber=${accountNumber}${params}`);
      const response = await apiService.put(`/api/Account/UpdateBalance?accountNumber=${accountNumber}${params}`, updateRequest);
      console.log('API Response - UpdateBalance:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('API Error - UpdateBalance:', error?.response?.data || error);
      throw error;
    }
  },

  async deleteAccount(accountNumber: number): Promise<void> {
    try {
      await apiService.delete(`/api/Account/DeleteAccount?accountNumber=${accountNumber}`);
    } catch (error: any) {
      console.error('API Error:', error?.response?.data || error);
      throw error;
    }
  },

  async activateAccount(accountNumber: number): Promise<void> {
    try {
      await apiService.post(`/api/Account/ActivateAccount?accountNumber=${accountNumber}`, {});
    } catch (error: any) {
      console.error('API Error:', error?.response?.data || error);
      throw error;
    }
  }
};

export default AccountApiService;
