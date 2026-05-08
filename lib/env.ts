export function getRequiredEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} 환경변수가 필요합니다.`);
  }

  return value;
}

export function hasRequiredEnv(names: string[]) {
  return names.every((name) => Boolean(process.env[name]));
}
