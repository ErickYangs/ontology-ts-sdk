import { Address } from '../../src/crypto/address';
import { PrivateKey } from '../../src/crypto/PrivateKey';
import { PublicKey } from '../../src/crypto/PublicKey';
import { WebsocketClient } from '../../src/network/websocket/websocketClient';

import { RestClient } from '../../src';
import { getAttributes, getAuthorizeInfo, getConfiguration, getGlobalParam,
    getGovernanceView, getPeerPoolMap, getPeerUnboundOng, getSplitFeeAddress,
    getTotalStake, makeAuthorizeForPeerTx, makeChangeAuthorizationTx,
    makeSetPeerCostTx, makeSetFeePercentageTx, makeUnauthorizeForPeerTx, makeWithdrawFeeTx, makeWithdrawPeerUnboundOngTx, makeWithdrawTx
} from '../../src/smartcontract/nativevm/governanceContractTxBuilder';
import { signTransaction } from '../../src/transaction/transactionBuilder';
import {TEST_ONT_URL_1, TEST_ONT_URL_2} from "../../src/consts";

describe('test governance authorization', () => {
    // TODO Extract hardcoded ip values to const-config file
    const socketClient = new WebsocketClient('ws://139.219.128.220:20335');
    const nodeUrl = 'http://139.219.128.220:20334';
    const restClient = new RestClient(nodeUrl);
    const gasPrice = '0';
    const gasLimit = '20000';
    const stake1 = {
        ontid: 'did:ont:AJTMXN8LQEFv3yg8cYKWGWPbkz9KEB36EM',
        ontidPass: '920410',
        peerPubkey: '02f4c0a18ae38a65b070820e3e51583fd3aea06fee2dc4c03328e4b4115c622567',
        address: 'AHqbLqY8wCXFcEGK5cKZzQig2bAfxTrpnL',
        addrPass: '123456'
    };
    const stake1Account = { 'address': 'AHqbLqY8wCXFcEGK5cKZzQig2bAfxTrpnL', 'label': 'wwww', 'lock': false, 'algorithm': 'ECDSA', 'parameters': { curve: 'P-256' }, 'key': 'p6+xORnKA3uWYOpLECWJ5tCMmxeK/0ZD2m7mOO10i+nx6KuPBtnsCe9tls0J68+f', 'enc-alg': 'aes-256-gcm', 'salt': '1b8neI2vZr8rUVEbmRCzWQ==', 'isDefault': true, 'publicKey': '02f2a7a368f515a40e1c9a626d29df2b845e73aaec742a20ca968a8fe542a674e9', 'signatureScheme': 'SHA256withECDSA' };

    const stake2 = {
        ontid: 'did:ont:AUEKhXNsoAT27HJwwqFGbpRy8QLHUMBMPz',
        ontidPass: '111111',
        peerPubkey: '03f6149b3a982c046912731d6374305e2bc8e278fa90892f6f20a8ee85c1d5443f',
        address: 'ANYR5cPbKfSeHJXHrK1fP6q5uzqXsg1MmF',
        addrPass: '123456'
    };
    const stake2Account = { 'address': 'ANYR5cPbKfSeHJXHrK1fP6q5uzqXsg1MmF', 'label': 'qqqq', 'lock': false, 'algorithm': 'ECDSA', 'parameters': { curve: 'P-256' }, 'key': 'CjO1FcDRCq/aT7kcWZAsv3mOLxtDnJ+enFdLHKhLLLHI8JK9ivuL2e1RXfSWy0gZ', 'enc-alg': 'aes-256-gcm', 'salt': 'pztdtlWov/o2GKH4SSU3nQ==', 'isDefault': true, 'publicKey': '02f4c0a18ae38a65b070820e3e51583fd3aea06fee2dc4c03328e4b4115c622567', 'signatureScheme': 'SHA256withECDSA' };

    const account1 = { 'address': 'AaMHKcpRUuFbhDtrc2raf6K2629LkLWEfL', 'label': 'testHex64', 'lock': false, 'algorithm': 'ECDSA', 'parameters': { curve: 'P-256' }, 'key': 'FCmwz1ukdUkhqnJThCYAgxf6Xx2oZ/PSBPi/wl4w32IR+RMrMzwDrIGNbNBhnd1c', 'enc-alg': 'aes-256-gcm', 'salt': 'ku63qE/TwEAlEyTxJTSHkg==', 'isDefault': true, 'publicKey': '02301589d59d6b78ca23dcc0f674a5210a4745d8e42d5b42ee1c4e720d3e05f4b3', 'signatureScheme': 'SHA256withECDSA' };
    const account2 = { 'address': 'ATfw74wvyQGSxbA7EZNXYN9wj74GNnTtXT', 'label': '托尔斯泰', 'lock': false, 'algorithm': 'ECDSA', 'parameters': { curve: 'P-256' }, 'key': '6B1j4kkclNgJMBYiYJ74Ogh0PJ4f7UA8alAVk58kkotMC7u/VVjKJ9159RMO/C9Y', 'enc-alg': 'aes-256-gcm', 'salt': 'rhZrBuUgGM5iMGX/nmuz+Q==', 'isDefault': true, 'publicKey': '02815af6fc10ec59ac387287265d6a9cb963b8c6fb446ae4ba3e00eb479d83a6c8', 'signatureScheme': 'SHA256withECDSA' };
    const account3 = { 'address': 'AGVbH7fK28bcybSxetR3juPdKEXKX4cJsa', 'label': '22e2a02d', 'lock': false, 'algorithm': 'ECDSA', 'parameters': { curve: 'P-256' }, 'key': 'TtYFBPz+kCsqIySh4O/KYqpUMoRVwIs/mps16srolzD/ZFP/rjsmChE/Z2hZ7tEE', 'enc-alg': 'aes-256-gcm', 'salt': '28fI51NGeRPWLzdTDYJaUQ==', 'isDefault': true, 'publicKey': '0303ed30d674e8076143e451cf69a126f77ac2c3d6c264087cdc69235e623f3020', 'signatureScheme': 'SHA256withECDSA' };
    const account4 = { 'address': 'AaCoH9veFJcrbrq9JriMgybf6d1dnLdEcJ', 'label': 'etwtwew', 'lock': false, 'algorithm': 'ECDSA', 'parameters': { curve: 'P-256' }, 'key': 'PodanUwt2gheR1v8jPSyVPgWIHxrL3hDXQBeSMotI+XNcwNV/D+zypufMXzVhEsV', 'enc-alg': 'aes-256-gcm', 'salt': 'EhIF6MNP+u4Wzs/W18LHZQ==', 'isDefault': true, 'publicKey': '03f4aff6e979ef03f6147769ebcb5839844d9dc69e1929431eb510154bca205026', 'signatureScheme': 'SHA256withECDSA' };

    const posAmount = 500;

    const getPrivatekey = (account, password) => {
        let pri;
        const params = {
            cost: 16384, // 除以2时间减半
            blockSize: 8,
            parallel: 8,
            size: 64
        };
        const enc = new PrivateKey(account.key);
        const address = new Address(account.address);
        try {
            pri = enc.decrypt(password, address, account.salt, params);
        } catch (err) {
            pri = null;
        }
        return pri;
    };
    test('changeAuthorization', async () => {
        const stake = stake2;
        const pk = stake.peerPubkey;
        const address = new Address(stake.address);
        const maxAuthorize = 500;
        const tx = makeChangeAuthorizationTx(pk, address, maxAuthorize, address, gasPrice, gasLimit);
        const pri = getPrivatekey(stake2Account, stake.addrPass);
        signTransaction(tx, pri);
        const response = await socketClient.sendRawTransaction(tx.serialize(), false, true);
        // tslint:disable:no-console
        console.log(JSON.stringify(response));
    }, 10000);

    test('setPeerCost', async () => {
        const stake = stake2;
        const pk = stake.peerPubkey;
        const address = new Address(stake.address);
        const peerCost = 50;
        const tx = makeSetPeerCostTx(pk, address, peerCost, address, gasPrice, gasLimit);
        const pri = getPrivatekey(stake2Account, stake.addrPass);
        signTransaction(tx, pri);
        const response = await socketClient.sendRawTransaction(tx.serialize(), false, true);
        // tslint:disable:no-console
        console.log(JSON.stringify(response));
    }, 10000);

    test('setFeePercentageTx', async () => {
        const stake = stake2;
        const pk = stake.peerPubkey;
        const address = new Address(stake.address);
        const peerCost = 50;
        const stakeCost = 50;
        const tx = makeSetFeePercentageTx(pk, address, peerCost, stakeCost, address, gasPrice, gasLimit);
        const pri = getPrivatekey(stake2Account, stake.addrPass);
        signTransaction(tx, pri);
        const response = await socketClient.sendRawTransaction(tx.serialize(), false, true);
        // tslint:disable:no-console
        console.log(JSON.stringify(response));
    }, 10000);

    test('withdrawFee', async () => {
        const account = account4;
        const address = new Address(account.address);
        const tx = makeWithdrawFeeTx(address, address, gasPrice, gasLimit);
        const pri = getPrivatekey(account, '123456');
        signTransaction(tx, pri);
        const response = await socketClient.sendRawTransaction(tx.serialize(), false, true);
        // tslint:disable:no-console
        console.log(JSON.stringify(response));
    }, 10000);

    test('authorizePeer', async () => {
        const account = account1;
        const address = new Address(account.address);
        const peerPubkeyList = [stake2.peerPubkey];
        const posList = [posAmount];
        const tx = makeAuthorizeForPeerTx(address, peerPubkeyList, posList, address, gasPrice, gasLimit);
        const pri = getPrivatekey(account, '123456');
        signTransaction(tx, pri);
        const response = await socketClient.sendRawTransaction(tx.serialize(), false, true);
        // tslint:disable:no-console
        console.log(JSON.stringify(response));
        // const res = await restClient.sendRawTransaction(tx.serialize());
        // console.log(res);
    }, 10000);

    test('unAuthorizeForPeer', async () => {
        const account = account1;
        const address = new Address(account.address);
        const peerPubkeyList = [stake1.peerPubkey];
        const posList = [1000];
        const tx = makeUnauthorizeForPeerTx(address, peerPubkeyList, posList, address, gasPrice, gasLimit);
        const pri = getPrivatekey(account, '123456');
        signTransaction(tx, pri);
        const response = await socketClient.sendRawTransaction(tx.serialize(), false, true);
        // tslint:disable:no-console
        console.log(JSON.stringify(response));
    }, 10000);

    test('Ontwithdraw', async () => {
        const account = account1;
        const address = new Address(account.address);
        const peerPubkeyList = [stake1.peerPubkey];
        const withdrawList = [1500];
        const tx = makeWithdrawTx(address, peerPubkeyList, withdrawList, address, gasPrice, gasLimit);
        const pri = getPrivatekey(account, '123456');
        signTransaction(tx, pri);
        const response = await socketClient.sendRawTransaction(tx.serialize(), false, true);
        // tslint:disable:no-console
        console.log(JSON.stringify(response));
    });

    test('getAttributes', async () => {
        const pk = '03eb7ce3df085d268b9c3d80ee262ee8ba0ed98af45d0be4197f231143ba07c41f';
        const res = await getAttributes(pk, TEST_ONT_URL_1.REST_URL);
        console.log(res);
    }, 10000);

    test('getSplitFeeAddress', async () => {
        const address = new Address(stake1.address);
        const res = await getSplitFeeAddress(address, nodeUrl);
        console.log(res);
    }, 10000);

    test('getPeerPoolMap', async () => {
        const res = await getPeerPoolMap(TEST_ONT_URL_2.REST_URL);
        console.log(res);
        const pk = '02f28c436b132edc663fd169c45f22d30eefe141d8413ca0045bd28fa32dcf1072';
        console.log(res[pk]);
        console.log(res[pk].address.toBase58())
    }, 10000);

    test('getAuthorizeInfo', async () => {
        // const pk = stake2.peerPubkey;
        const pk = '03131bbcf941dbac550faf1fdee064961e6ed72803692cefa2d21a019ee9dcf37f';
        // const userAddr = new Address(account4.address);
        const userAddr = new Address('AViTVz9sBQMRqCiHHxNwgj8NmyjSnzKwPw');
        const res = await getAuthorizeInfo(pk, userAddr, TEST_ONT_URL_2.REST_URL);
        console.log(res);
    }, 10000);

    test('testPass', () => {
        const pk = '033d9aea7fb2f72bb3b1db9e2416f32f313b5489b626d34fb576440c7220995e11';
        const address = Address.fromPubKey(new PublicKey(pk)).toBase58();
        expect(address).toEqual('AUg53MTnZ8x8awYvbgV8zhxxsrCgG3jqjc');
    });

    test('getGovernanceView', async () => {
        const view = await getGovernanceView(nodeUrl);
        console.log(view);
    }, 1000);

    test('getGlobalParam', async () => {
        const view = await getGlobalParam(nodeUrl);
        console.log(view);
    }, 1000);

    test('getTotalStake', async () => {
        const addr = new Address('AazEvfQPcQ2GEFFPLF1ZLwQ7K5jDn81hve');
        const ts = await getTotalStake(addr, TEST_ONT_URL_1.REST_URL);
        console.log(ts);
    });

    test('getUnboundOng', async () => {
        const addr = new Address('AJiEBNzr4NeAyaQx6qn1jgNkLFCgxtTt5U');
        const nodeUrl = 'http://dappnode1.ont.io:20334' // TODO Should we use main node url in tests ?
        const unbound = await getPeerUnboundOng(addr, nodeUrl);
        console.log(unbound);
    });

    test('withdrawOng', async () => {
        const addr = new Address(stake2.address);
        const tx = await makeWithdrawPeerUnboundOngTx(addr, addr, gasPrice, gasLimit);
        const pri = getPrivatekey(stake2Account, '123456');
        signTransaction(tx, pri);
        const response = await socketClient.sendRawTransaction(tx.serialize(), false, true);
        // tslint:disable:no-console
        console.log(JSON.stringify(response));
    });

    test('getConfiguration', async () => {
        const url = 'http://dappnode1.ont.io:20334';  // TODO Should we use main node url in tests ?
        const config = await getConfiguration(url);
        console.log(config);
    });

});
