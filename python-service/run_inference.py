"""
Deal Intelligence Agent - CLI Inference Runner
Enables fast, reliable IPC execution from Node.js Express backend.
"""

import sys
import json
import argparse
from services.prediction_service import PredictionService

def main():
    parser = argparse.ArgumentParser(description="Deal Intelligence Agent ML Inference Runner")
    parser.add_argument("--task", required=True, choices=["risk", "outcome", "cycle", "similar", "simulation", "forecast", "status", "model"])
    parser.add_argument("--deal-id", default="")
    parser.add_argument("--discount", type=float, default=5.0)
    parser.add_argument("--duration", type=int, default=12)
    parser.add_argument("--product", default="")
    parser.add_argument("--model-name", default="")
    parser.add_argument("--top-k", type=int, default=5)

    args = parser.parse_args()

    service = PredictionService()

    try:
        if args.task == "risk":
            result = service.predict_risk(args.deal_id)
        elif args.task == "outcome":
            result = service.predict_outcome(args.deal_id)
        elif args.task == "cycle":
            result = service.predict_cycle(args.deal_id)
        elif args.task == "similar":
            result = service.recall_similar(args.deal_id, top_k=args.top_k)
        elif args.task == "simulation":
            scenario = {
                "discountPercent": args.discount,
                "contractDurationMonths": args.duration,
                "productPackage": args.product or "Enterprise Intelligence Suite"
            }
            result = service.simulate(args.deal_id, scenario)
        elif args.task == "forecast":
            result = service.forecast()
        elif args.task == "status":
            result = service.get_models_status()
        elif args.task == "model":
            model = service.registry.get_model(args.model_name)
            result = model if model else {"error": f"Model {args.model_name} not found"}
        else:
            result = {"error": f"Unknown task {args.task}"}

        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({"status": "MODEL_ERROR", "error": str(e)}))
        sys.exit(1)

if __name__ == "__main__":
    main()
