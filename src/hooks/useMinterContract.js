import {useContract} from './useContract';
import RelicNFTStoreAbi from '../contracts/RelicStore.json';
import RelicNFTStoreContractAddress from '../contracts/RelicNFTStore-address.json';


// export interface for NFT contract
export const useMinterContract = () => useContract(RelicNFTStoreAbi.abi, RelicNFTStoreContractAddress.RelicNFTStore);
