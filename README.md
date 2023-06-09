## Basic Information
- Website Demo - https://smart-auction.vercel.app
- Notion (문서화) - https://www.notion.so/blockchain-lighthouse/Smart-Auction-333f6f42679c4eb49fbfd7cb58ee0415?pvs=4
- FlowChart (Figma) - https://www.figma.com/file/9fhBD0GWdURzlrHBrtTJwn/Smart-Auction?type=whiteboard&node-id=0-1&t=qJBv68426AOTqB8Q-0
- https://www.notion.so/blockchain-lighthouse/Smart-Auction-333f6f42679c4eb49fbfd7cb58ee0415?pvs=4

---

## Summary
본 프로젝트는 블록체인 기술을 활용해 중고 거래에서 발생하는 사기 사례 문제에 대하여 개선해보고자 시도하는 프로젝트다. 본 프로젝트에서 달성하고자 하는 목표는 아래와 같다.
1. 구매자에게 고지한 내용과 상이한 상품이 전달되는 문제 완화
  - Smart Contract에 Matic이 전달되고 판매자가 고지한 내용과 상이한 상품을 전달할 경우, 구매자는 서명해주지 않는다.
  - 판매자의 출금기능 작동을 위해서는 Smart Contract ecrecover 내장함수를 거쳐 서명검증이 이루어져야한다. 때문에 저장된 Signature 정보를 중도에 Service Provider가 위변조를 하거나 어떠한 상황에서 일치하지 않을 경우 구매자의 EOA주소가 정상적으로 나오지 출력되지 않으며 출금이 불가하다.
2. 거래시 가격할인요청 등을 통한 정보와 상이한 금액을 전달하는 문제 완화
  - Auction 입찰방식을 채택해 금액을 Smart Contract로 선입금하므로 중도 가격 할인 요청이 불가.

기존 웹사이트와 같은 사용자 경험을 제공하기 위해 회원가입 후 입력한 Password로 Keystore를 암호화해 생성해준다. 이후 서비스를 이용할 때 Keystore를 유저의 비밀번호를 통해 복호화하고 SignTransaction이 가능하도록 구성함으로써 사용자는 “메타마스크”나, “서명” 등의 불편함 없이 사용이 가능하다. 또한 Sprint 1에서 Polygon Testnet을 사용해 Ethereum Testnet보다 낮은 가스비를 가져가고자 하였으나, 여전히 높은 가스비 문제와 낮은 속도 문제로 인해 사용성이 낮아졌고, Hyperledger Besu를 사용해 IBFT 블록체인 Private Network를 구성해 트랜잭션 속도 문제와 가스비 문제를 완화해 사용성을 높혔다.
  
![zsc](https://user-images.githubusercontent.com/66409384/232184665-d2b34c96-c833-4d70-bd32-ce04e9517187.png)

---

## Dapp Architecture
![architecture](https://user-images.githubusercontent.com/66409384/235842519-b5d6f7f2-5881-4332-b731-fc4eae15c08d.png)

---

## Smart Contract & Backend Consturction Skills
- `Private Network` : Hyperledger Besu IBFT Blockchain Network
- `Solidity` : Smart Contract Language
- `Hardhat` : Smart Contract Development Tool
- `Remix` : Solidity IDE & Deploy Tool
- `Openzepplin` : Solidity Library
- `ethers.js` : Web3 interaction javascript library
- `Node.js` : Backend API
- `TypeORM` : Object-Relational Mapping for RDB Tool
- `MySQL` : DB
- `AWS Cloud` : Cloud Service
- `Github Action & Runner`
- `Ghcr`

---

## Preview
![SmartAuction_auction](https://user-images.githubusercontent.com/66409384/233330254-334feef9-8660-49e7-a6f7-c13f2ea3c14e.gif)

---

## Contract 경로
```
  cd contract/contracts
```

---


## Contributors
- <a href="https://github.com/blockmonkey1992">`Blockmonkey`</a> : Backend & Blockchain 개발
- <a href="https://github.com/ctdlog">`Ctdlog`</a> : Frontend 개발
