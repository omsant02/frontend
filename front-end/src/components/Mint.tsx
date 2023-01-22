import {React, useState} from 'react';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import { Typography } from '@mui/material';
import {SwapButton} from '../soroban/SwapButton';
import { useIsPetAdopted } from '../soroban/useIsPetAdopted';
import { SorobanContextType, useSorobanReact } from '@soroban-react/core';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import { type } from 'os';
import Button from '@mui/material/Button';



import * as SorobanClient from 'soroban-client'
import BigNumber from 'bignumber.js'
import {useContractValue, useSendTransaction} from '@soroban-react/contracts'
//import {useSendTransaction} from '../useSendTransaction'
import {scvalToString} from '@soroban-react/utils'
import {Constants} from '../constants'
import { setTrustline } from '../setTrustline';
import {currencies} from '../currencies'


function MintButton({
        sorobanContext,
        tokenId,
        tokenSymbol,
        amountToMint     
        }:{
          sorobanContext: SorobanContextType,
          tokenId: string,
          tokenSymbol: string,
          amountToMint: BigNumber
          }){
  const [isSubmitting, setSubmitting] = useState(false)
  const networkPassphrase = sorobanContext.activeChain?.networkPassphrase ?? ''
  const { sendTransaction } = useSendTransaction()
  const setTrustlineAndMint = async () => {
    setSubmitting(true)
    const server = sorobanContext.server
    const account = sorobanContext.address
    if (!server) throw new Error("Not connected to server")
    if (!account) throw new Error("Not connected to server")

    let { sequence, balances } = await server.getAccount(Constants.TokenAdmin)
          let adminSource = new SorobanClient.Account(Constants.TokenAdmin, sequence)

          let wallet = await server.getAccount(account)
          let walletSource = new SorobanClient.Account(wallet.id, wallet.sequence)

          //
          // 1. Establish a trustline to the admin (if necessary)
          // 2. The admin sends us money (mint)
          //
          // We have to do this in two separate transactions because one
          // requires approval from Freighter while the other can be done with
          // the stored token issuer's secret key.
          //
          // FIXME: The `getAccount()` RPC endpoint doesn't return `balances`,
          //        so we never know whether or not the user needs a trustline
          //        to receive the minted asset.
          //
          // Today, we establish the trustline unconditionally.
          //

          if (!balances || balances.filter(b => (
            b.asset_code == tokenSymbol && b.asset_issuer == Constants.TokenAdmin
          )).length === 0) {
            try {

              
              

              let trustlineResult = await setTrustline({
                tokenSymbol: tokenSymbol,
                tokenAdmin: Constants.TokenAdmin,
                account: account,
                sorobanContext: sorobanContext,
                sendTransaction: sendTransaction
              })
            } catch (err) {
              console.error(err)
              console.log("error while creating trustline")
            }
          }
          

          try {
            const paymentResult = await sendTransaction(
              new SorobanClient.TransactionBuilder(adminSource, {
                networkPassphrase,
                fee: "1000",
              })
              .setTimeout(10)
              .addOperation(
                SorobanClient.Operation.payment({
                  destination: wallet.id,
                  asset: new SorobanClient.Asset(tokenSymbol, Constants.TokenAdmin),
                  amount: amountToMint.toString(),
                })
              )
              .build(), {
                timeout: 10 * 1000,
                skipAddingFootprint: true,
                secretKey: Constants.TokenAdminSecretKey,
                sorobanContext
              }
            )
            console.debug(paymentResult)
            console.log("paymentResult: ", paymentResult)
          } catch (err) {
            console.error(err)
            console.log("error while minting")
          }
          //
          // TODO: Show some user feedback while we are awaiting, and then based
          // on the result
          //
          setSubmitting(false)
  } // end of setTrustlineAndMint function

  return(
    <Button
      onClick={setTrustlineAndMint}
      disabled={isSubmitting}
    >Mint and create Trustline</Button>
  )

}

export function Mint (){
    const sorobanContext = useSorobanReact()
    const [inputToken, setInputToken] = useState(currencies[0]);
    const [mintTokenId, setMintTokenId] = useState(Constants.TokenId_1);
    const [tokenSymbol, setTokenSymbol] = useState(currencies[0].symbol);
    const [amount, setAmount] = useState(BigNumber(0));
    


    const handleInputTokenChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      if(event.target.value == currencies[0].value){
        setInputToken(currencies[0]);
        setMintTokenId(Constants.TokenId_1)
        setTokenSymbol(currencies[0].symbol)
      }
      else{
        setInputToken(currencies[1]);
        setMintTokenId(Constants.TokenId_2)
        setTokenSymbol(currencies[1].symbol)
      }
    };

    const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      setAmount(BigNumber(event.target.value))
    };

    // TODO: REMOVE HARDOCDED SYMBOL
    /*
    let symbol = useContractValue({ 
      contractId: tokenId,
      method: 'symbol',
      sorobanContext
    })
    const tokenSymbol = symbol.result && scvalToString(symbol.result)?.replace("\u0000", "")

*/


    return (   
    <Card sx={{ maxWidth: 345 }}>
      <CardContent>
        <Typography gutterBottom variant="h5" component="div">
       Mint 
        </Typography>
        <TextField
          id="outlined-select-currency"
          select
          label="Token to Mint"
          defaultValue="XLM"
          onChange={handleInputTokenChange}
        >
{currencies.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
        <p>.</p>
        <FormControl>
          <InputLabel htmlFor="outlined-adornment-amount">Amount to Mint</InputLabel>
          <OutlinedInput
            type="number"
            id="outlined-adornment-amount"
            onChange={handleAmountChange}
            startAdornment={<InputAdornment position="start">
              {inputToken.shortlabel}
            </InputAdornment>}
            label="Amount"
          />
        </FormControl>
        
        
      </CardContent>
      <CardActions>
        <MintButton
          sorobanContext={sorobanContext}
          tokenId={mintTokenId}
          tokenSymbol={tokenSymbol}
          amountToMint={amount}
          >
          MINT!
        </MintButton>
      </CardActions>
      
    </Card>
  );
}