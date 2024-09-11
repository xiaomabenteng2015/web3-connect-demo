import { Button, Modal } from "antd";
import { useState } from "react";
import { ethers } from "ethers";
import { useWriteYexiyueTokenPermit, yexiyueTokenAddress } from "@/generated";

declare let window: any
export const Permit = () => {
    const [open, setOpen] = useState(false);
    const { writeContractAsync: permit } = useWriteYexiyueTokenPermit();

    // permit
    async function calculateSignature() {

        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const owner = await signer.getAddress();
        const spender = "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC";
        const value = ethers.utils.parseUnits("100", 18); // 100 个代币
        const deadline = Date.now() + 60 * 60 * 24 * 365; // 截止时间 
        const network = await provider.getNetwork();
        const chainID = network.chainId;
        const tokenContract = new ethers.Contract(yexiyueTokenAddress, ["function nonces(address owner) view returns (uint256)"], provider);
        // console.log("tokenContract",tokenContract);
        const nonce = await tokenContract.nonces(owner);
        // console.log("nonce",nonce);
        const domain = {
            name: "YexiyueToken",
            version: "1",
            chainId: chainID,
            verifyingContract: yexiyueTokenAddress
        }
        const types = {
            Permit: [
                { name: "owner", type: "address" },
                { name: "spender", type: "address" },
                { name: "value", type: "uint256" },
                { name: "nonce", type: "uint256" },
                { name: "deadline", type: "uint256" }
            ]
        }
        const toSignValue = {
            owner: owner,
            spender: spender,
            value: value.toBigInt(),
            nonce: nonce,
            deadline: deadline
        }


        const signature = await signer._signTypedData(domain, types, toSignValue);

        // console.log("signature",signature);
        const { v, r, s } = ethers.utils.splitSignature(signature);

        console.log("vvvvvvvvvvvvvvvvvvvv");
        console.log("owner", owner);
        console.log("spender", spender);
        console.log("value", value.toBigInt());
        console.log("nonce", nonce);
        console.log("deadline", deadline);
        console.log("v", v);
        console.log("r", r);
        console.log("s", s);

        await permit({
            args: [
                owner as `0x${string}`,
                spender,
                value.toBigInt(),
                BigInt(deadline),
                v,
                r as `0x${string}`,
                s as `0x${string}`
            ],
        });
    }

    const onOk = async () => {
        calculateSignature();
        setOpen(false);
    };

    return (
        <>
            <Button type="primary" onClick={() => setOpen(true)}> permit function </Button>
            <Modal title="permit function" visible={open} onCancel={() => setOpen(false)} onOk={onOk}>
                <p>点击OK 进行Permit调用</p>
            </Modal>
        </>
    )
}