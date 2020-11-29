import openBrowser from 'open';
import ora from 'ora';
import Proxy from '~/proxy';

export default async function open({
  clusterId,
  noFail,
  ns,
  port,
  rancherUrl,
  serviceName
}: OpenOptions): Promise<any> {
  try {
    const spinner = ora();
    const proxy = new Proxy(rancherUrl, clusterId, ns);
    const url = await proxy.calculate(serviceName, port);
    if (!url && !noFail) {
      throw new Error(
        `unable to find service ${serviceName} in namespace ${proxy.ns} for cluster ${proxy.clusterId} at ${proxy.rancherUrl}`
      );
    }
    if (!url) return;
    spinner.start(`opening ${url}`);
    await openBrowser(url);
    spinner.succeed(`opened ${url}`);
  } catch (err) {
    if (!noFail) throw err;
  }
}

export interface OpenOptions {
  clusterId?: string;
  noFail?: boolean;
  ns?: string;
  port?: string;
  rancherUrl?: string;
  serviceName: string;
}
