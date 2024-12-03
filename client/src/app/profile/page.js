import { WalletContext } from "@/context/wallet";
import { useContext, useEffect, useState, useCallback } from "react";
import { ethers } from "ethers";
import MarketplaceJson from "../marketplace.json";
import styles from "./profile.module.css";
import Header from "../components/header/Header";
import Footer from "../components/footer/Footer";
import axios from "axios";
import NFTTile from "../components/nftCard/NFTCard";

export default function Profile() {
  const [items, setItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState("0");
  const { isConnected, userAddress, signer } = useContext(WalletContext);

  // Wrap getNFTitems with useCallback to avoid unnecessary re-creation
  const getNFTitems = useCallback(async () => {
    try {
      if (!signer || !userAddress) return { itemsArray: [], sumPrice: 0 };

      const itemsArray = [];
      let sumPrice = 0;

      const contract = new ethers.Contract(
        MarketplaceJson.address,
        MarketplaceJson.abi,
        signer
      );

      const transactions = await contract.getMyNFTs();
      console.log("Transactions:", transactions);

      for (const txn of transactions) {
        if (txn[2].toLowerCase() === userAddress.toLowerCase()) {
          const tokenId = parseInt(txn.tokenId);
          const tokenURI = await contract.tokenURI(tokenId);
          const meta = (await axios.get(tokenURI)).data;
          const price = ethers.formatEther(txn.price);

          const item = {
            price,
            tokenId,
            seller: txn.seller,
            owner: txn.owner,
            image: meta.image,
            name: meta.name,
            description: meta.description,
          };

          itemsArray.push(item);
          sumPrice += Number(price);
        }
      }
      return { itemsArray, sumPrice };
    } catch (error) {
      console.error("Error fetching NFT items:", error);
      return { itemsArray: [], sumPrice: 0 };
    }
  }, [signer, userAddress]);

  // Fetch data when dependencies change
  useEffect(() => {
    const fetchData = async () => {
      const { itemsArray, sumPrice } = await getNFTitems();
      setItems(itemsArray);
      setTotalPrice(sumPrice);
    };

    if (isConnected) fetchData();
  }, [isConnected, getNFTitems]);
  return (
    <div className={styles.container}>
      <Header />
      <div className={styles.innerContainer}>
        <div className={styles.content}>
          {isConnected ? (
            <>
              <div className={styles.userInfo}>
                <span className={styles.label}>Wallet Address:</span>
                <span className={styles.address}>{userAddress}</span>
              </div>
              <div className={styles.stats}>
                <div className={styles.stat}>
                  <span className={styles.label}>Number of NFTs:</span>
                  <span className={styles.value}>{items?.length}</span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.label}>Total Value:</span>
                  <span className={styles.value}>{totalPrice} ETH</span>
                </div>
              </div>
              <div className={styles.nftSection}>
                <h2 className={styles.heading}>Your NFTs</h2>
                {items?.length > 0 ? (
                  <div className={styles.nftGrid}>
                    {items?.map((value, index) => (
                      <NFTTile item={value} key={index} />
                    ))}
                  </div>
                ) : (
                  <div className={styles.noNFT}>You don't have any NFT...</div>
                )}
              </div>
            </>
          ) : (
            <div className={styles.notConnected}>You are not connected...</div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
