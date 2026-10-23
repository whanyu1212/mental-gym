"""Start an IPython kernel and verify that it can execute Python
code."""

import ipykernel
from jupyter_client import KernelManager


def main() -> None:
    """Exercise the notebook runtime and always clean up the kernel
    process."""
    manager = KernelManager(kernel_name="python3", transport="ipc")
    client = None
    try:
        manager.start_kernel()
        client = manager.blocking_client()
        client.start_channels()
        client.wait_for_ready(timeout=30)
        message_id = client.execute("assert 1 + 1 == 2")
        while True:
            reply = client.get_shell_msg(timeout=30)
            if reply["parent_header"].get("msg_id") == message_id:
                break
        if reply["content"]["status"] != "ok":
            raise RuntimeError(f"Kernel execution failed: {reply['content']}")
        print(f"ipykernel {ipykernel.__version__}: execution succeeded")
    finally:
        if client is not None:
            client.stop_channels()
        if manager.has_kernel:
            manager.shutdown_kernel(now=True)


if __name__ == "__main__":
    main()
