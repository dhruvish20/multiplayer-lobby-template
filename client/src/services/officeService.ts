import axios from "axios";

const API_BASE_URL = "http://localhost:5001";

export const createOfficeAPI = async (officeName: string, token: string) => {
  const response = await axios.post(
    `${API_BASE_URL}/office/create`,
    { name: officeName },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data;
};

export const joinOfficeAPI = async (officeCode: string, token: string) => {
  const response = await axios.post(
    `${API_BASE_URL}/office/join`,
    { code: officeCode },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data;
};
