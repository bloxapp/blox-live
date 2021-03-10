[<img src="./internals/img/bloxstaking_header_image.png" >](https://www.bloxstaking.com/)

<br>
<br>

<div align="center">

[![Build Status][github-actions-status]][github-actions-url]
[![Dependency Status][david-image]][david-url]
[![DevDependency Status][david-dev-image]][david-dev-url]
[![Github Tag][github-tag-image]][github-tag-url]
[![Discord](https://discord.com/api/guilds/723834989506068561/widget.png?style=shield)](https://discord.gg/HpT2z5B)
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fbloxapp%2Fblox-live.svg?type=shield)](https://app.fossa.com/projects/git%2Bgithub.com%2Fbloxapp%2Fblox-live?ref=badge_shield)

</div>

## Blox Staking - Desktop App
Blox is an open-source, fully non-custodial staking platform for Ethereum 2.0. The platform serves as an easy and accessible way to stake Ether and earn rewards on Eth2, while ensuring participants retain complete control over their private keys. Our goal at Blox is to simplify staking while ensuring Ethereum stays fair and decentralized. 

The Blox Live Desktop App is the gateway to convenient non-custodial staking on Eth2. Admin actions are performed in Blox Live for validator set up and management. Blox Live is run locally, offering the highest level of security and is responsible for the following key features:

<ul>
  <li>Key Management</li>
  <li>KeyVault Remote Signer Management</li>
  <li>Validator Monitoring Dashboard</li>
</ul>

Blox Live bundles together all of the functionality for securely managing backups, key imports, creating and managing validators, and more. Live maintains direct connectivity with Blox Infra and the user’s cloud service, on which KeyVault remote signer is installed.

#### Eth2 Staking Services
When considering an Eth2 staking service, it is important to understand how these services manage user private keys. Generally, the more centralized the service, the higher the security risks and penalties its users may face.  

#### Custodial vs. Non-Custodial Staking
A major differentiator between staking services is level of custodianship; meaning, how a service stores user private keys. Most staking services are custodial or ‘centralized.’ 
Custodial staking services manage the entire ETH staking process on behalf of the user and have ‘custody’ over user private keys.  This level of third party involvement raises major security breach concerns.
Additionally, should the service inadvertently partake in a slashable event, its users face steep penalties given that slashing penalties grow exponentially the more validators are involved in an event. The larger the centralized service, the larger the potential penalties.

#### Our Non-Custodial Staking Solution
In order to be truly non-custodial we developed a solution that ensures that user keys cannot be compromised in any way, all the while, segregating user private keys from Blox 
The result --->  an open-source Desktop app, (AKA Blox Live), which grants a user management access to an individualized remote signing environment in which validator keys are securely stored and signing requests are properly managed.


### Download
Download the app from https://www.bloxstaking.com/download

### Compatibility
- macOS
- Windows
- Ubuntu (coming soon)

## Development

BloxStaking app development run smoothly with [Yarn](https://classic.yarnpkg.com/)

### Install

```bash
yarn
```

### Build

```bash
yarn build
```

### Run development version

```bash
yarn dev
```

#### Different dev modes

##### Zoom the app

```shell
zoom=-1 yarn dev
```

See [Zoom Levels](https://github.com/electron/electron/blob/master/docs/api/web-frame.md#webframesetzoomlevellevel)

### Create packages

BloxStaking desktop app can run on MacOs and Windows. You can create a package from your development enviroment. 

#### Pacakage for MacOS release

```bash
yarn package-mac
```

#### Pacakage for Windows release

```bash
yarn package-win
```
You can find the release files under release directory.

#### Logger

Logger has two appenders, file `trace.log` and `console.log`.
```bash
logger.trace - console.log only
logger.debug - console.log only

logger.info - console.log + trace.log file
logger.warn - console.log + trace.log file
logger.error - console.log + trace.log file
```

## Tech Stack

- <a href="https://www.electronjs.org">ElectronJS</a> To create a cross desktop app for all operating systems.
- <a href="https://expressjs.com/">Express</a>, <a href="https://webpack.js.org/">Webpack</a> and <a href="https://babeljs.io/">Babel</a> - For development purpose and build file creation
- <a href="https://reactjs.org/">React 16.8</a> - To handle front end tasks in scale
- <a href="https://reacttraining.com/react-router/web/guides/quick-start">React Router</a> - For application navigation and routing
- <a href="https://redux.js.org/">Redux</a> and <a href="https://redux-saga.js.org/">Redux Saga</a> - A UI state management and middleware to handle async operations
- <a href="https://github.com/axios/axios">Axios</a> - Promise based HTTP client
- <a href="https://styled-components.com/">Styled Components</a> - A CSS-in-JS library to make styling more dynamic and easy
- <a href="https://github.com/auth0/auth0.js#readme">Auth0 JS</a> - To authenticate and authorize users in the app
- <a href="https://www.typescriptlang.org/">TypeScript</a> and <a href="https://eslint.org/">ESlint</a> - For better development experience, linting errors, type checking, auto complete and more
- <a href="https://jestjs.io/">Jest JS</a> and <a href="https://reactjs.org/docs/test-renderer.html">React Test Renderer</a> - Testing tools for React applications
- <a href="https://coveralls.io/">Coveralls</a> - Code testing coverage 

## Docs (TBD)

See our [docs and guides here](https://www.bloxstaking.com/blox-blog/)

## Maintainers

- [David Marciano](https://github.com/david-blox)
- [Oleg Shmuelov](https://github.com/olegshmuelov)
- [Vadim Chumak](https://github.com/vadiminc)
- [Niv Muroch](https://github.com/nivBlox)
- [Lior Rutenberg](https://github.com/lior-blox)

## License

GPL © [Blox Live](https://github.com/bloxapp/blox-live)

[github-actions-status]: https://github.com/bloxapp/blox-live/workflows/Test/badge.svg?branch=stage	
[github-actions-url]: https://github.com/bloxapp/blox-live/actions	
[github-tag-image]: https://img.shields.io/github/v/tag/bloxapp/blox-live.svg?label=version	
[github-tag-url]: https://github.com/bloxapp/blox-live.svg/releases/latest	
[david-image]: https://david-dm.org/bloxapp/blox-live/stage/status.svg	
[david-url]: https://david-dm.org/bloxapp/blox-live/stage	
[david-dev-image]: https://david-dm.org/bloxapp/blox-live/stage/dev-status.svg	
[david-dev-url]: https://david-dm.org/bloxapp/blox-live/stage?type=dev	


[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fbloxapp%2Fblox-live.svg?type=large)](https://app.fossa.com/projects/git%2Bgithub.com%2Fbloxapp%2Fblox-live?ref=badge_large)