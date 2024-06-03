import { getHttpEndpoint } from "@orbs-network/ton-access";
import { mnemonicToWalletKey } from "ton-crypto";
import { TonClient, WalletContractV4, fromNano, internal } from "ton";

async function main() {
    // open wallet v4 (notice the correct wallet version here)
    const mnemonic = "kidney sign umbrella enforce unhappy roof pen syrup choice meadow inspire ramp pistol soup extend obey claw twenty mouse tape wrestle impose stool runway"; // your 24 secret words (replace ... with the rest of the words)
    const key = await mnemonicToWalletKey(mnemonic.split(" "));
    const wallet = WalletContractV4.create({ publicKey: key.publicKey, workchain: 0 });

    // initialize ton rpc client on testnet
    const endpoint = await getHttpEndpoint({ network: "testnet" });
    const client = new TonClient({ endpoint });

    // To get wallet address
    console.log(wallet.address);
    console.log(await client.isContractDeployed(wallet.address));

    // To display balance
    const balance = await client.getBalance(wallet.address);
    console.log("balane ", fromNano(balance));

    // make sure wallet is deployed
    if (!await client.isContractDeployed(wallet.address)) {
        return console.log("wallet is not deployed");
    }

    // send 0.05 TON to EQA4V9tF4lY2S_J-sEQR7aUj9IwW-Ou2vJQlCn--2DLOLR5e ( For NFT claiming)

    // blockchain provider
    const walletContract = client.open(wallet);
    // sequence number
    const seqno = await walletContract.getSeqno();
    await walletContract.sendTransfer({
        secretKey: key.secretKey,
        seqno: seqno,
        messages: [
            internal({
                to: "0QAZP6VknUtNmExqJedhKhe6lVKiouwm5Sy9Qqxx9Ztt7hTR",
                value: "0.05", // 0.05 TON
                body: "Hello", // optional comment
                bounce: false,
            })
        ]
    });

    // wait until confirmed
    let currentSeqno = seqno;
    while (currentSeqno == seqno) {
        console.log("waiting for transaction to confirm...");
        await sleep(1500);
        currentSeqno = await walletContract.getSeqno();
    }
    console.log("transaction confirmed!");
}

main();

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}