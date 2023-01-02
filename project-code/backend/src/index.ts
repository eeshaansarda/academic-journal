import {useContainer} from "routing-controllers";
import {Container} from "typedi";
useContainer(Container);

import Server from '@server/server';
import { config } from "@config/config";

const server = new Server(config);
server.start();