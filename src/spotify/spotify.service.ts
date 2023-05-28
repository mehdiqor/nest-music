import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class SpotifyService {
  constructor(private config: ConfigService) {}

  async getToken() {
    const client_id = this.config.get('CLIENT_ID');
    const client_secret = this.config.get('CLIENT_SECRET');

    const response = await axios({
      url: 'https://accounts.spotify.com/api/token',
      method: 'post',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      // For Basic Authorization (curl -u), set via auth:
      auth: {
        username: client_id,
        password: client_secret,
      },
      // This will urlencode the data correctly:
      data: new URLSearchParams({
        grant_type: 'client_credentials',
      }),
    });

    return response.data;
  }

  async getArtist(id: string) {
    const { access_token } = await this.getToken();

    const response = await axios.get(
      `https://api.spotify.com/v1/artists/${id}`,
      {
        headers: {
          Authorization: `Bearer  ${access_token}`,
        },
      },
    );

    return response.data;
  }
}
