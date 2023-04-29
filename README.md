## Basic Information
- Website Demo - https://smart-auction.vercel.app
- Smart Contract - https://mumbai.polygonscan.com/address/0xb8ae402fbc75092de7505bb50e0f39f99e4fd9a9
- Front-End(Github) - https://github.com/Blockchain-Lighthouse/SmartAuction_FE
- Notion (문서화) - https://www.notion.so/blockchain-lighthouse/Dapp-Smart-Auction-c02b95128c0f41cb86c9b67fb4f6f194?pvs=4

---

## Summary
본 프로젝트는 블록체인 기술을 활용해 중고 거래에서 발생하는 사기 사례 문제에 대하여 개선해보고자 시도하는 프로젝트다. 본 프로젝트에서 달성하고자 하는 목표는 아래와 같다.
1. 구매자에게 고지한 내용과 상이한 상품이 전달되는 문제 완화
  - Smart Contract에 Matic이 전달되고 판매자가 고지한 내용과 상이한 상품을 전달할 경우, 구매자는 서명해주지 않는다.
  - 판매자의 출금기능 작동을 위해서는 Smart Contract ecrecover 내장함수를 거쳐 서명검증이 이루어져야한다. 때문에 저장된 Signature 정보를 중도에 Service Provider가 위변조를 하거나 어떠한 상황에서 일치하지 않을 경우 구매자의 EOA주소가 정상적으로 나오지 출력되지 않으며 출금이 불가하다.
2. 거래시 가격할인요청 등을 통한 정보와 상이한 금액을 전달하는 문제 완화
  - Auction 입찰방식을 채택해 금액을 Smart Contract로 선입금하므로 중도 가격 할인 요청이 불가.

Web2와 같은 사용자 경험 제공을 위하여 사용자에게 Mnemonic 등록 절차를 거쳐 암호화 된 Keystore를 부여해, 추후 서비스 이용시 Keystore를 사용자의 비밀번호로 복호화해 Sign Transaction을 전송할 수 있도록 구성했다. 또한 경매 정보를 IFPS에 등록하여 Service Provider의 데이터 위변조 가능성을 최소화하고, Auction Contract에 Factory Pattern을 적용하여 구매자 또는 판매자는 자신이 관계된 Contract 데이터를 바로 확인할 수 있도록 구성했다. 또한 사용자 경험 개선을 위하여 Call Static으로 EVM 상태변화 없이 사전 호출을 통해 Transaction 성공 여부를 사전에 확인하고 Transaction을 발생시키도록 하여 트랜잭션 실패로 가스 비용이 낭비되는 위험성을 최소화하여 구성했다. 
  
![zsc](https://user-images.githubusercontent.com/66409384/232184665-d2b34c96-c833-4d70-bd32-ce04e9517187.png)

---

## Dapp Architecture
![ㅋㅊㄴㅋㄴㅊ](https://user-images.githubusercontent.com/66409384/235303468-e75f5354-408e-4292-98ca-11a08a22c259.png)

---

## Smart Contract & Backend Consturction Skills
- `Polygon Testnet (Mumbai)` : Blockchain Network
- `Solidity` : Smart Contract Language
- `Hardhat` : Smart Contract Development Tool
- `Remix` : Solidity IDE & Deploy Tool
- `Openzepplin` : Solidity Library
- `ethers.js` : Web3 interaction javascript library
- `Alchemy` : Blockchain Develop Service
- `Node.js` : Backend API
- `TypeORM` : Object-Relational Mapping for RDB Tool
- `MySQL` : Relational Databse
- `AWS Cloud` : Cloud Service
- `Github Action` : For Continuous Integration & Continuous Deploy

---

## Preview
![SmartAuction_auction](https://user-images.githubusercontent.com/66409384/233330254-334feef9-8660-49e7-a6f7-c13f2ea3c14e.gif)

---

## Contributors
- <a href="https://github.com/blockmonkey1992">`Blockmonkey`</a> : Backend & Smart Contract 개발
- <a href="https://github.com/ctdlog">`Ctdlog`</a> : Frontend 개발
