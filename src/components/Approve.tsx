import { Button, Modal } from "antd";
import { useState } from "react";
import { useWriteYexiyueTokenApprove } from "@/generated";

export const Approve = () => {
  const [open, setOpen] = useState(false);
  const { writeContractAsync: approve } = useWriteYexiyueTokenApprove();
  const onOk = async () => {
    // 调用授权操作
    await approve({
      args: [
        "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC"
        , 100_000_000_000_000_000_000n]
    });
    setOpen(false);
  };
  return (
    <>
      <Button type="primary" onClick={() => setOpen(true)} > approve function </Button>
      <Modal title="approve" visible={open} onOk={onOk} onCancel={() => { setOpen(false); }} >请点击OK去授权</Modal>
    </>
  )
}