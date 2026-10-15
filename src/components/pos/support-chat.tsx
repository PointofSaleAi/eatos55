import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

const SUPPORT_CHAT_URL = "https://go.crisp.chat/chat/embed/?website_id=cf9ee4db-97df-4864-8fa6-194ad4762b95";

export function SupportChat({ open, onClose }: { open: boolean; onClose: () => void }) {
  return <Dialog open={open} onOpenChange={next => { if (!next) onClose(); }}>
    <DialogContent aria-describedby={undefined} className="left-auto right-3 top-auto bottom-[calc(var(--tabs-h,0px)+1rem)] flex h-[min(44rem,calc(100dvh-7rem))] w-[calc(100%-1.5rem)] max-w-[35.5rem] translate-x-0 translate-y-0 flex-col gap-0 overflow-hidden rounded-lg p-0 sm:right-5">
      <div className="flex shrink-0 items-center justify-between border-b border-border bg-surface px-4 py-2">
        <DialogTitle className="text-fs-sm">eatOS Support</DialogTitle>
        <Button variant="ghost" size="icon" title="Close support chat" aria-label="Close support chat" onClick={onClose}><ChevronDown /></Button>
      </div>
      <iframe title="eatOS support chat" src={SUPPORT_CHAT_URL} className="min-h-0 w-full flex-1 border-0 bg-surface" allow="microphone" referrerPolicy="strict-origin-when-cross-origin" />
    </DialogContent>
  </Dialog>;
}