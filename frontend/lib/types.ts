export type User = {
  id: number;
  name: string;
  email: string;
};

export type Destination = {
  id: number;
  name: string;
  description: string | null;
  location: string | null;
  country: string | null;
  city: string | null;
  imageUrl: string | null;
  createdAt: string | null;
};

export type Trip = {
  id: number;
  title: string;
  description: string | null;
  startDate: string;
  endDate: string;
  budget: number | null;
  userId: number;
  userName: string;
  destination: Destination;
  createdAt: string | null;
};
