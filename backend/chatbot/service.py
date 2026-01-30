import os
from langchain_groq import ChatGroq
from langchain.chains import RetrievalQA
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS

# ======================
# ENV
# ======================
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

# ======================
# LLM
# ======================
llm = ChatGroq(
    groq_api_key=GROQ_API_KEY,
    model="llama-3.3-70b-versatile",
    temperature=0.3,
    max_tokens=400,
)

# ======================
# EMBEDDINGS
# ======================
embeddings = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2"
)

# ======================
# CACHE FAISS
# ======================
VECTOR_CACHE = {}

def load_vectorstore_for_class(kelas):
    if kelas in VECTOR_CACHE:
        return VECTOR_CACHE[kelas]

    path = f"vectorstore/{kelas}"
    if os.path.exists(path):
        db = FAISS.load_local(
            path,
            embeddings,
            allow_dangerous_deserialization=True
        )
        VECTOR_CACHE[kelas] = db
        return db

    return None

# ======================
# PROMPT
# ======================
SYSTEM_PROMPT = """
Kamu adalah guru SD.
Jawaban harus:
- Bahasa Indonesia sederhana
- Sesuai usia anak
- Berdasarkan materi buku
"""

# ======================
# CHATBOT
# ======================
def ask_chatbot(message: str, kelas: str = None) -> str:
    try:
        prompt = SYSTEM_PROMPT + "\n\n" + message

        if kelas:
            db = load_vectorstore_for_class(kelas)
            if db:
                retriever = db.as_retriever(search_kwargs={"k": 3})
                qa = RetrievalQA.from_chain_type(
                    llm=llm,
                    retriever=retriever
                )
                return qa.run(prompt)

        # fallback LLM biasa
        response = llm.invoke(prompt)
        return response.content

    except Exception as e:
        return f"❌ Error chatbot: {str(e)}"
    


