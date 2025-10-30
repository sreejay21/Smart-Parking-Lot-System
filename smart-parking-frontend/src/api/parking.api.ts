import axiosClient from "./axiosClient";

export const checkIn = (payload: {
  number: string;
  type: string;
  owner?: string;
}) => axiosClient.post("/parking/checkin", payload).then((res) => res.data);

export const checkOut = (number: string) =>
  axiosClient
    .post(`/parking/checkout/${encodeURIComponent(number)}`)
    .then((res) => res.data);

export const getAvailability = () =>
  axiosClient.get("/parking/availability").then((res) => res.data);

export const getTransactions = () =>
  axiosClient.get("/parking/transactions").then((res) => res.data);

export const getRevenue = () =>
  axiosClient.get("/parking/revenue").then((res) => res.data);
