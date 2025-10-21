// Tests unitaires API (mock axios)
import axios from 'axios';
import { getCustomers } from '../src/utils/api.js';

jest.mock('axios');

describe('API utils', () => {
  test('getCustomers returns data', async () => {
    const mockData = { content: [{ id: 1, firstName: 'John' }] };
    axios.get.mockResolvedValueOnce({ data: mockData });
    const result = await getCustomers();
    expect(result).toEqual(mockData.content);
  });
});
