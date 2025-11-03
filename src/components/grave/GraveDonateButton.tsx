import { SecureLogger } from '@/lib/security/secure-logger';
"use client";

import { useState, useCallback } from "react";
import { useGraveContract } from "@/hooks/grave/useGraveContract";
import { useTonConnect } from "@/contexts/ton-connect-context";
import { Address, toNano, beginCell } from "@ton/core";
import { ethers } from "ethers";

interface GraveDonateButtonProps {
  memorialId: string;
  memorialAddress?: string;
  artistName: string;
  onSuccess?: () => void;
}

type Chain = "TON" | "SOL" | "ETH";

const CHAIN_NAMES = {
  TON: "TON",
  SOL: "Solana",
  ETH: "Ethereum",
};

const MIN_AMOUNTS = {
  TON: 0.1,
  SOL: 0.1,
  ETH: 0.01,
};

const MAX_AMOUNTS = {
  TON: 100,
  SOL: 10,
  ETH: 100,
};

export default function GraveDonateButton({
  memorialId,
  memorialAddress,
  artistName,
  onSuccess,
}: GraveDonateButtonProps) {
  const [selectedChain, setSelectedChain] = useState<Chain>("ETH");
  const [amount, setAmount] = useState("0.1");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState<"chain" | "details" | "confirm">("chain");
  const [transactionHash, setTransactionHash] = useState("");

  const {
    connected: tonConnected,
    account: tonAccount,
    connectWallet: connectTON,
    sendTransaction: sendTONTransaction,
  } = useTonConnect();

  const {
    isConnected: ethConnected,
    isLoading: ethLoading,
    error: ethError,
    userAddress,
    donate: donatETH,
    clearError: clearEthError,
  } = useGraveContract({
    contractAddress: process.env.NEXT_PUBLIC_GRAVE_CONTRACT_ADDRESS,
    autoInitialize: true,
  });

  // Validate amount
  const isValidAmount = () => {
    const num = parseFloat(amount);
    return (
      num >= MIN_AMOUNTS[selectedChain] && num <= MAX_AMOUNTS[selectedChain]
    );
  };

  // Donate via TON
  const handleDonateTON = useCallback(async () => {
    if (!tonConnected || !tonAccount) {
      await connectTON();
      return;
    }

    if (!memorialAddress) {
      alert("Memorial address not configured");
      return;
    }

    if (!isValidAmount()) {
      alert(
        `Amount must be between ${MIN_AMOUNTS.TON} and ${MAX_AMOUNTS.TON} TON`,
      );
      return;
    }

    setIsLoading(true);
    try {
      const senderAddress = Address.parse(tonAccount.address);

      // Create donation payload
      const body = beginCell()
        .storeUint(0x4c494748, 32) // "LIGH" opcode for candle lighting
        .storeAddress(senderAddress)
        .storeRef(
          beginCell()
            .storeUint(0, 8) // String tag
            .storeStringTail(message || `Donation to ${artistName}`)
            .endCell(),
        )
        .endCell();

      const destination = Address.parse(memorialAddress).toString();

      await sendTONTransaction({
        messages: [
          {
            address: destination,
            amount: toNano(amount).toString(),
            payload: body.toBoc().toString("base64"),
          },
        ],
        validUntil: Math.floor(Date.now() / 1000) + 5 * 60,
      });

      // Success
      setTransactionHash(`TON_${Date.now()}`);
      setStep("confirm");

      if (onSuccess) {
        onSuccess();
      }

      // Also log to backend
      try {
        await fetch("/api/grave/donations", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-telegram-init-data": "tma-initiated", // For backend compatibility
          },
          body: JSON.stringify({
            memorialId,
            amount: parseFloat(amount),
            currency: "TON",
            message: message || `Donation to ${artistName}`,
            donorAddress: tonAccount.address,
            chainId: "254", // TON chain ID
          }),
        });
      } catch (error) {
        SecureLogger.warn("Could not log TON donation to backend:", error);
      }

      setTimeout(() => {
        setShowModal(false);
        setAmount("0.1");
        setMessage("");
        setStep("chain");
        setTransactionHash("");
      }, 3000);
    } catch (error: any) {
      SecureLogger.error("TON donation error:", error);
      alert(`❌ Donation failed: ${error.message || "Unknown error"}`);
    } finally {
      setIsLoading(false);
    }
  }, [
    tonConnected,
    tonAccount,
    memorialAddress,
    amount,
    message,
    artistName,
    memorialId,
    onSuccess,
  ]);

  // Donate via Ethereum
  const handleDonateETH = useCallback(async () => {
    if (!ethConnected || !userAddress) {
      alert("Please connect your Ethereum wallet first");
      return;
    }

    if (!isValidAmount()) {
      alert(
        `Amount must be between ${MIN_AMOUNTS.ETH} and ${MAX_AMOUNTS.ETH} ETH`,
      );
      return;
    }

    setIsLoading(true);
    try {
      const result = await donatETH(memorialId, {
        amount,
        message: message || `Donation to ${artistName}`,
        isAnonymous: false,
      });

      if (result && result.transactionHash) {
        setTransactionHash(result.transactionHash);
        setStep("confirm");

        if (onSuccess) {
          onSuccess();
        }

        setTimeout(() => {
          setShowModal(false);
          setAmount("0.1");
          setMessage("");
          setStep("chain");
          setTransactionHash("");
        }, 3000);
      }
    } catch (error: any) {
      SecureLogger.error("ETH donation error:", error);
      alert(`❌ Donation failed: ${error.message || "Unknown error"}`);
    } finally {
      setIsLoading(false);
    }
  }, [
    ethConnected,
    userAddress,
    memorialId,
    amount,
    message,
    artistName,
    donatETH,
    onSuccess,
  ]);

  // Donate via Solana (placeholder)
  const handleDonateSOL = useCallback(async () => {
    alert("🎵 Solana integration coming soon!\nStay tuned for SOL donations.");
  }, []);

  const handleDonate = async () => {
    switch (selectedChain) {
      case "TON":
        await handleDonateTON();
        break;
      case "ETH":
        await handleDonateETH();
        break;
      case "SOL":
        await handleDonateSOL();
        break;
    }
  };

  const renderStepContent = () => {
    if (step === "chain") {
      return (
        <div className="space-y-4">
          <h3 className="font-bold text-lg">Choose Blockchain Network</h3>

          <div className="grid grid-cols-3 gap-2">
            {(["TON", "ETH", "SOL"] as Chain[]).map((chain) => (
              <button
                key={chain}
                onClick={() => {
                  setSelectedChain(chain);
                  setStep("details");
                }}
                disabled={chain === "SOL"}
                className={`btn btn-outline ${
                  chain === "SOL" ? "btn-disabled" : ""
                } flex flex-col h-auto py-4`}
              >
                <span className="text-2xl mb-1">
                  {chain === "TON" && "⚡"}
                  {chain === "ETH" && "🔷"}
                  {chain === "SOL" && "◎"}
                </span>
                <span className="text-xs font-bold">{chain}</span>
                {chain === "SOL" && (
                  <span className="badge badge-xs mt-1">Soon</span>
                )}
              </button>
            ))}
          </div>

          <div className="alert alert-info">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="stroke-current shrink-0 w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="text-sm">
              All networks are secure and verified. Gas fees may apply.
            </div>
          </div>
        </div>
      );
    }

    if (step === "details") {
      const isReady =
        selectedChain === "TON"
          ? tonConnected
          : selectedChain === "ETH"
            ? ethConnected
            : false;

      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg flex items-center gap-2">
              {selectedChain === "TON" && "⚡"}
              {selectedChain === "ETH" && "🔷"}
              Light Candle for {artistName}
            </h3>
            <button
              onClick={() => setStep("chain")}
              className="btn btn-ghost btn-sm"
            >
              Change
            </button>
          </div>

          {/* Connection Status */}
          {!isReady && (
            <div className="alert alert-warning">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="stroke-current shrink-0 h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <span>
                {selectedChain === "TON"
                  ? "Connect TON wallet"
                  : "Connect Ethereum wallet"}{" "}
                to donate
              </span>
              <button
                onClick={selectedChain === "TON" ? connectTON : undefined}
                className="btn btn-sm btn-primary"
              >
                Connect
              </button>
            </div>
          )}

          {ethError && selectedChain === "ETH" && (
            <div className="alert alert-error">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="stroke-current shrink-0 h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 14l-2-2m0 0l-2-2m2 2l2-2m-2 2l-2 2m9-11a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{ethError}</span>
              <button onClick={clearEthError} className="btn btn-sm btn-ghost">
                Dismiss
              </button>
            </div>
          )}

          {/* Amount Input */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">
                Amount ({selectedChain})
              </span>
              <span className="label-text-alt">
                {isValidAmount() ? "✓" : "✗"} Valid
              </span>
            </label>
            <input
              type="number"
              step="0.1"
              min={MIN_AMOUNTS[selectedChain]}
              max={MAX_AMOUNTS[selectedChain]}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={`input input-bordered w-full ${
                !isValidAmount() ? "input-error" : ""
              }`}
              placeholder={MIN_AMOUNTS[selectedChain].toString()}
            />
            <label className="label">
              <span className="label-text-alt">
                Min: {MIN_AMOUNTS[selectedChain]} • Max:{" "}
                {MAX_AMOUNTS[selectedChain]} {selectedChain}
              </span>
            </label>
          </div>

          {/* Message Input */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">
                Message (Optional)
              </span>
              <span className="label-text-alt">{message.length}/200</span>
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value.substring(0, 200))}
              className="textarea textarea-bordered h-24"
              placeholder="Leave a message in memory..."
            />
          </div>

          {/* Fee Breakdown */}
          <div className="card bg-base-200 p-4">
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span>Your donation:</span>
                <span className="font-bold">
                  {amount} {selectedChain}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Platform fee (2%):</span>
                <span>
                  -{(parseFloat(amount) * 0.02).toFixed(4)} {selectedChain}
                </span>
              </div>
              <div className="divider my-2"></div>
              <div className="flex justify-between text-lg font-bold">
                <span>Beneficiaries get:</span>
                <span className="text-success">
                  {(parseFloat(amount) * 0.98).toFixed(4)} {selectedChain}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="modal-action">
            <button
              onClick={() => setStep("chain")}
              className="btn btn-ghost flex-1"
              disabled={isLoading}
            >
              Back
            </button>
            <button
              onClick={() => setStep("confirm")}
              className="btn btn-primary flex-1"
              disabled={!isReady || !isValidAmount() || isLoading}
            >
              {isLoading ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Processing...
                </>
              ) : (
                `Confirm (${amount} ${selectedChain})`
              )}
            </button>
          </div>
        </div>
      );
    }

    if (step === "confirm") {
      return (
        <div className="space-y-6 text-center">
          <div className="text-6xl animate-bounce">🕯️</div>

          {transactionHash ? (
            <>
              <div>
                <h3 className="font-bold text-2xl text-success mb-2">
                  ✅ Candle Lit!
                </h3>
                <p className="text-sm text-gray-600">
                  {amount} {selectedChain} donated to {artistName}'s memorial
                </p>
              </div>

              <div className="card bg-base-200 p-4 text-left">
                <div className="text-xs space-y-2">
                  <div>
                    <span className="font-semibold">Network:</span>
                    <span className="float-right">{selectedChain}</span>
                  </div>
                  <div>
                    <span className="font-semibold">Amount:</span>
                    <span className="float-right">
                      {amount} {selectedChain}
                    </span>
                  </div>
                  {message && (
                    <div>
                      <span className="font-semibold">Message:</span>
                      <div className="mt-1 break-words">{message}</div>
                    </div>
                  )}
                  <div>
                    <span className="font-semibold">Transaction:</span>
                    <div className="mt-1 font-mono text-xs break-all text-blue-600">
                      {transactionHash.substring(0, 20)}...
                    </div>
                  </div>
                </div>
              </div>

              <div className="alert alert-success">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="stroke-current shrink-0 h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>Your candle will burn forever in the memorial</span>
              </div>

              <p className="text-xs text-gray-500">
                Closing in 3 seconds... or press close
              </p>
            </>
          ) : (
            <div className="py-8">
              <span className="loading loading-spinner loading-lg"></span>
              <p className="mt-4 font-semibold">Processing donation...</p>
              <p className="text-sm text-gray-600">
                Please confirm in your wallet
              </p>
            </div>
          )}

          <div className="modal-action">
            <button
              onClick={() => {
                setShowModal(false);
                setAmount(MIN_AMOUNTS[selectedChain].toString());
                setMessage("");
                setStep("chain");
                setTransactionHash("");
              }}
              className="btn btn-primary w-full"
              disabled={!transactionHash && isLoading}
            >
              {transactionHash ? "Close" : "Cancel"}
            </button>
          </div>
        </div>
      );
    }
  };

  return (
    <>
      <button
        onClick={() => {
          setShowModal(true);
          setStep("chain");
        }}
        className="btn btn-primary gap-2"
      >
        🕯️ Light Candle
      </button>

      {showModal && (
        <div className="modal modal-open">
          <div className="modal-box max-w-md">
            {renderStepContent()}

            <div className="modal-action absolute top-4 right-4">
              <button
                onClick={() => {
                  setShowModal(false);
                  setStep("chain");
                  setTransactionHash("");
                }}
                className="btn btn-sm btn-circle btn-ghost"
                disabled={isLoading && step !== "confirm"}
              >
                ✕
              </button>
            </div>
          </div>
          <div
            className="modal-backdrop"
            onClick={() => !isLoading && setShowModal(false)}
          />
        </div>
      )}
    </>
  );
}
