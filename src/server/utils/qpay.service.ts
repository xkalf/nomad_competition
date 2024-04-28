export class QpayService {
  private username: string = "TEST_MERCHANT";
  private password: string = "123456";
  private baseUrl: string = "https://merchant-sandbox.qpay.mn";
  private accessToken?: string;
  private refreshToken?: string;

  constructor(username: string, password: string) {
    this.username = username;
    this.password = password;
  }

  async getToken() {
    const req = await fetch(`${this.baseUrl}/v2/auth/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${btoa(`${this.username}:${this.password}`)}`,
      },
    });

    const res: {
      access_token: string;
      refresh_token: string;
    } = await req.json();

    this.accessToken = res.access_token;
    this.refreshToken = res.refresh_token;
  }

  async refreshCurrentToken() {
    if (!this.refreshToken) return this.getToken();

    const req = await fetch(`${this.baseUrl}/v2/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.refreshToken}`,
      },
    });

    const res: {
      access_token: string;
      refresh_token: string;
    } = await req.json();

    this.accessToken = res.access_token;
    this.refreshToken = res.refresh_token;
  }
}
