"use client"
import Nav from "@/components/Nav";

export default function Home() {
  const submitHandler = (e: { preventDefault: () => void; currentTarget: HTMLFormElement | undefined; }) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    console.log(data.get("url1"), data.get("url2"));
  }

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans">
      <Nav />
      <div className="flex flex-1 items-center justify-center font-sans pt-5">
        <form
          onSubmit={submitHandler}
          className="flex flex-col gap-3 w-full max-w-md"
        >
          <input name="url1" type="url" placeholder="First clip URL" className="border rounded px-3 py-2" required />
          <input name="url2" type="url" placeholder="Second clip URL" className="border rounded px-3 py-2" required />
          <button type="submit" className="bg-black text-white rounded px-3 py-2">
            Analyze
          </button>
        </form>
      </div>
    </div>
  );
}
