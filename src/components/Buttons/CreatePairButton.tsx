import { SorobanContextType } from "@soroban-react/core";
import {
  contractTransaction,
  useSendTransaction,
} from "@soroban-react/contracts";
import { bigNumberToI128 } from "../../helpers/utils";
import BigNumber from "bignumber.js";
import { useState } from "react";
import * as SorobanClient from "soroban-client";
import { Button } from "@mui/material";
import { TokenType } from "../../interfaces";
import { useFactory } from "../../hooks";
import { accountToScVal } from "../../helpers/utils";


interface CreatePairProps {
  token0: TokenType;
  token1: TokenType
  sorobanContext: SorobanContextType;
}

export function CreatePairButton({
  token0,
  token1,
  sorobanContext,
}: CreatePairProps) {
  const factory = useFactory(sorobanContext);
  const [isSubmitting, setSubmitting] = useState(false);
  const networkPassphrase = sorobanContext.activeChain?.networkPassphrase ?? "";
  const server = sorobanContext.server;
  const account = sorobanContext.address;
  const addressScVal0 = accountToScVal(token0.address);
  const addressScVal1 = accountToScVal(token1.address);
  const params = [addressScVal0, addressScVal1];

  let xdr = SorobanClient.xdr;
  const { sendTransaction } = useSendTransaction();


  const createPair = async () => {
    setSubmitting(true);

    let walletSource;

    if (!account) {
      console.log("Error on account:", account)
      return;
    }

    try {
      walletSource = await server?.getAccount(account!);
    } catch (error) {
      alert("Your wallet or the token admin wallet might not be funded");
      setSubmitting(false);
      return;
    }
    if(!walletSource){
      console.log("Error on walletSource:", walletSource)
      return
    }   
    const options = {
      sorobanContext,
    };

    try {
      //Builds the transaction
      let tx = contractTransaction({
        source: walletSource!,
        networkPassphrase,
        contractAddress: factory.factory_address,
        method: "create_pair", 
        args: params,
      });

      //Sends the transactions to the blockchain
      console.log(tx);

      let result = await sendTransaction(tx, options);

      if (result) {
        alert("Success!");
      }

      //This will connect again the wallet to fetch its data
      sorobanContext.connect();
    } catch (error) {
      console.log("🚀 « error:", error);
    }

    setSubmitting(false);
  };

  return (
    <Button variant="contained" onClick={createPair} disabled={isSubmitting}>
      Create Pair!
    </Button>
  );
}
