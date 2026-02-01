import apiService from './apiService';

export interface TransactionResponseModel {
  transactionId: string;
  accountNumber: number;
  transactionAmount: number;
  transactionMode: string; // "UPI" | "NetBanking" | "ATM"
  transactionType: string; // "Debit" | "Credit"
  transactionOn: string;
  status: string; // "Failed" | "Pass"
  updatedBalance: number;
}

export interface TransactionRequestModel {
  accountNumber: number;
  transactionAmount: number;
  transactionMode: string; // "UPI" | "NetBanking" | "ATM"
  transactionType: string; // "Debit" | "Credit"
}

export enum TransactionMode {
  UPI = "UPI",
  NetBanking = "NetBanking",
  ATM = "ATM"
}

export enum TransactionStatus {
  Failed = "Failed",
  Pass = "Pass"
}

export enum TransactionType {
  Debit = "Debit",
  Credit = "Credit"
}

const TransactionApiService = {
  async getTransactionByDateRange(
    accountNumber: number,
    fromDate?: Date,
    toDate?: Date
  ): Promise<TransactionResponseModel[]> {
    try {
      let url = `/api/Transaction/GetTransactionByDateRange?accountNumber=${accountNumber}`;
      
      if (fromDate) {
        url += `&fromDate=${fromDate.toISOString()}`;
      }
      if (toDate) {
        url += `&toDate=${toDate.toISOString()}`;
      }
      
      console.log('Calling API: GetTransactionByDateRange with URL:', url);
      const response = await apiService.get(url);
      console.log('API Response - GetTransactionByDateRange:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('API Error - GetTransactionByDateRange:', error?.response?.data || error);
      throw error;
    }
  },

  async processTransaction(request: TransactionRequestModel): Promise<TransactionResponseModel> {
    try {
      console.log('Calling API: ProcessTransaction with request:', request);
      const response = await apiService.post('/api/Transaction/UpdateBalance', request);
      console.log('API Response - ProcessTransaction:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('API Error - ProcessTransaction:', error?.response?.data || error);
      throw error;
    }
  },

  async getLastNTransactions(
    count: number,
    accountNumber: number
  ): Promise<TransactionResponseModel[]> {
    try {
      const url = `/api/Transaction/GetLastNTransaction?count=${count}&accountNumber=${accountNumber}`;
      console.log('Calling API: GetLastNTransactions with URL:', url);
      const response = await apiService.get(url);
      console.log('API Response - GetLastNTransactions:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('API Error - GetLastNTransactions:', error?.response?.data || error);
      throw error;
    }
  }
};

export default TransactionApiService;
