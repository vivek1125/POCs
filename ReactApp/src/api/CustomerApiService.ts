import apiService from './apiService';

export interface CustomerData {
  id: number;
  name: string;
  mobile: string;
  email: string;
  address: string;
  status: string;
}

export interface NewCustomer {
  customerName: string;
  customerMobile: string;
  customerEmail: string;
  customerAddress: string;
}

const CustomerApiService = {
  async getCustomers() {
    const response = await apiService.get('/api/Customer/GetCustomers');
    return response.data;
  },
  async addCustomer(newCustomer: NewCustomer) {
    const response = await apiService.post('/api/Customer/AddCustomer', newCustomer);
    return response.data;
  },
  async activateCustomer(id: number) {
    const response = await apiService.post(`/api/Customer/ActivateCustomer/${id}`, {});
    return response.data;
  },
  async deactivateCustomer(id: number) {
    const response = await apiService.delete(`/api/Customer/DeleteCustomer/${id}`);
    return response.data;
  }
};

export default CustomerApiService;
