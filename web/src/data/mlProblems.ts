export type MLDifficulty = "Easy" | "Medium" | "Hard";

export interface MLProblem {
	id: string;
	slug: string;
	title: string;
	difficulty: MLDifficulty;
	category: string;
	tags: string[];
	summary: string;
	whyItMatters: string;
	prompt: string;
	expectations: string[];
	hints: string[];
	followUps: string[];
	status: "Placeholder" | "Completed";
	solution?: {
		python: string;
	};
}

export const mlProblems: MLProblem[] = [
	{
		id: "1",
		slug: "logistic-regression-from-scratch",
		title: "Logistic Regression from Scratch",
		difficulty: "Medium",
		category: "Classic ML",
		tags: ["ml", "optimization", "numpy"],
		summary:
			"Implement binary logistic regression with gradient descent, sigmoid activation, and binary cross-entropy loss.",
		whyItMatters:
			"A very common ML interview problem because it tests both modeling fundamentals and implementation discipline.",
		prompt:
			"You are given a feature matrix X and binary labels y. Build logistic regression from scratch without using a high-level ML library. Implement the sigmoid function, compute the binary cross-entropy loss, and train the weights with gradient descent. Return a fit() routine and a predict_proba() or predict() routine.",
		expectations: [
			"Represent weights and bias clearly and initialize them deterministically.",
			"Compute logits, sigmoid probabilities, and binary cross-entropy correctly.",
			"Perform one full gradient descent update for weights and bias.",
			"Discuss learning rate choice, convergence, and numerical stability.",
		],
		hints: [
			"Start with the forward pass: z = Xw + b, then apply sigmoid.",
			"Keep track of tensor or array shapes so gradients line up cleanly.",
			"If you compute log loss directly, guard against log(0).",
		],
		followUps: [
			"How would you make the loss numerically stable?",
			"How would you extend this to multiclass classification?",
			"What changes if the dataset does not fit in memory?",
		],
		status: "Completed",
		solution: {
			python: `import numpy as np

class LogisticRegression:
    def __init__(self, learning_rate=0.01, num_iterations=1000):
        self.learning_rate = learning_rate
        self.num_iterations = num_iterations
        self.weights = None
        self.bias = None

    def _sigmoid(self, z):
        # Clip z to prevent overflow in np.exp
        z = np.clip(z, -250, 250)
        return 1 / (1 + np.exp(-z))

    def fit(self, X, y):
        num_samples, num_features = X.shape

        # Initialize parameters
        self.weights = np.zeros(num_features)
        self.bias = 0

        # Gradient descent
        for _ in range(self.num_iterations):
            # Forward pass
            linear_model = np.dot(X, self.weights) + self.bias
            y_predicted = self._sigmoid(linear_model)

            # Backward pass (gradients)
            # dw shape: (num_features,)
            dw = (1 / num_samples) * np.dot(X.T, (y_predicted - y))
            # db is a scalar
            db = (1 / num_samples) * np.sum(y_predicted - y)

            # Update parameters
            self.weights -= self.learning_rate * dw
            self.bias -= self.learning_rate * db

    def predict_proba(self, X):
        linear_model = np.dot(X, self.weights) + self.bias
        return self._sigmoid(linear_model)

    def predict(self, X, threshold=0.5):
        y_predicted_prob = self.predict_proba(X)
        y_predicted_cls = [1 if i > threshold else 0 for i in y_predicted_prob]
        return np.array(y_predicted_cls)`
		}
	},
	{
		id: "2",
		slug: "confusion-matrix-and-f1",
		title: "Confusion Matrix + Precision / Recall / F1",
		difficulty: "Easy",
		category: "Evaluation",
		tags: ["metrics", "eval", "classification"],
		summary:
			"Given predicted labels and ground-truth labels, compute the confusion matrix, precision, recall, and F1 score.",
		whyItMatters:
			"Interviewers often use this to check whether a candidate understands model evaluation beyond raw accuracy.",
		prompt:
			"You are given arrays of ground-truth labels and predicted labels for a binary classifier. Compute true positives, false positives, true negatives, and false negatives. From those counts, calculate precision, recall, and F1 score. Handle edge cases such as division by zero cleanly.",
		expectations: [
			"Correctly count TP, FP, TN, and FN.",
			"Return precision, recall, and F1 using the standard definitions.",
			"Explain when F1 is more useful than accuracy.",
			"Handle degenerate cases such as no positive predictions.",
		],
		hints: [
			"Write the raw counts first before turning them into metrics.",
			"Be explicit about which label is treated as the positive class.",
			"Think about what should happen when a denominator becomes zero.",
		],
		followUps: [
			"How would you compute macro and micro F1?",
			"When would PR-AUC be more useful than ROC-AUC?",
			"How would you choose a classification threshold in production?",
		],
		status: "Placeholder",
	},
	{
		id: "3",
		slug: "scaled-dot-product-attention",
		title: "Scaled Dot-Product Attention",
		difficulty: "Medium",
		category: "Transformers",
		tags: ["genai", "transformers", "attention"],
		summary:
			"Implement the core attention operation using query, key, and value matrices, including scaling and softmax.",
		whyItMatters:
			"This has become one of the most common modern ML coding questions for LLM-leaning roles.",
		prompt:
			"You are given query, key, and value matrices for a single attention head. Compute attention scores, scale them by the square root of the key dimension, apply softmax, and use the resulting weights to form the output. Optionally support a mask that prevents attention to disallowed positions.",
		expectations: [
			"Compute QK^T with the right output shape.",
			"Scale scores by sqrt(d_k) before softmax.",
			"Apply softmax row-wise and combine with V to produce the output.",
			"Explain what the mask does in decoder-style causal attention.",
		],
		hints: [
			"Write down the expected shapes before coding.",
			"Softmax should run across the key dimension for each query position.",
			"For masking, set blocked positions to a very negative number before softmax.",
		],
		followUps: [
			"How does multi-head attention differ from single-head attention?",
			"Why is the scaling term important?",
			"What changes when you introduce a KV cache during inference?",
		],
		status: "Placeholder",
	},
	{
		id: "4",
		slug: "pytorch-training-loop",
		title: "PyTorch Training Loop",
		difficulty: "Easy",
		category: "ML Systems",
		tags: ["pytorch", "training", "systems"],
		summary:
			"Write a minimal training loop with forward pass, loss computation, backward pass, optimizer step, and validation.",
		whyItMatters:
			"Many ML engineer interviews now prefer framework fluency and practical training workflow questions.",
		prompt:
			"Using PyTorch, write a minimal supervised training loop for a model, optimizer, loss function, and dataloader. The loop should switch the model to train mode, compute predictions, calculate loss, backpropagate, step the optimizer, and zero gradients. Also include a validation pass in eval mode.",
		expectations: [
			"Use model.train() and model.eval() in the correct phases.",
			"Perform forward pass, loss calculation, backward pass, optimizer.step(), and optimizer.zero_grad().",
			"Disable gradient tracking during validation.",
			"Accumulate and report a simple epoch-level loss metric.",
		],
		hints: [
			"Validation should not update parameters.",
			"Remember the order of backward pass, optimizer step, and gradient reset.",
			"Keep the first version minimal before adding features like checkpointing.",
		],
		followUps: [
			"How would you add early stopping?",
			"How would you support mixed precision?",
			"What bugs cause training loss to look fine while validation quality stays poor?",
		],
		status: "Placeholder",
	},
];
