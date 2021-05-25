interface LoginType {
  email: string;
  password: string;
}

interface LoginPayload {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthType {
  token: string;
}

interface UserCreateType {
  name: string;
  email: string;
}
interface UserCreatePayload {
  id: string;
}

interface UserPayload extends LoginPayload {
  reportee: string;
  active: string;
}

interface AddReporteType {
  reportee: UserCreatePayload;
}
