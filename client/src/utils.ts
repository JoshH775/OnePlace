
type APIOptions = {
    method: string
    body?: object
}

const defaultOptions: APIOptions = {
    method: 'GET'
}

export async function api(path: string, options: APIOptions = defaultOptions) {
  const fetchOptions: RequestInit = {
    method: options.method,
    credentials: 'include'
  };

  if (options.body) {
    fetchOptions.body = JSON.stringify(options.body);
    fetchOptions.headers = {
      'Content-Type': 'application/json'
    };
  }
  

  const response = await fetch(`http://localhost:8000/api${path}`, fetchOptions);

  if (response.status === 401) {
    return { status: 401, data: 'Unauthorized' };
  }

  return { status: response.status, data: await response.json() };

}