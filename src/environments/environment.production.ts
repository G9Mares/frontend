export const environment = {
  production: true,
  // The production Nginx container forwards this path to the private backend
  // container. Keeping it relative makes the API work with either the EC2 IP
  // address or the final domain name, without exposing port 8000 publicly.
  apiBaseUrl: '/api',
};
