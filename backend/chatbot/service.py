import os
import json
from langchain_groq import ChatGroq
from langchain.chains import RetrievalQA
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS

GROQ_API_KEY = os.getenv("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")

llm = ChatGroq(
    api_key=GROQ_API_KEY,
    model_name="llama-3.3-70b-versatile",
    temperature=0.3,
    max_tokens=400,
)

embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")

def load_vectorstore_for_class(kelas):
    """Muat FAISS database sesuai kelas"""
    path = f"vectorstore/{kelas}"
    if os.path.exists(path):
        return FAISS.load_local(path, embeddings, allow_dangerous_deserialization=True)
    return None

def ask_chatbot(message: str, kelas: str = None) -> str:
    """Kirim pertanyaan ke chatbot sesuai kelas"""
    try:
        if kelas:
            db = load_vectorstore_for_class(kelas)
            if db:
                retriever = db.as_retriever(search_kwargs={"k": 3})
                qa = RetrievalQA.from_chain_type(llm=llm, retriever=retriever)
                result = qa.run(message)
                return result

        # fallback (jika vectorstore tidak ada)
        result = llm.invoke(message)
        return result.content
    except Exception as e:
        return f"❌ Error chatbot: {str(e)}"
