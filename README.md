# Unofficial DFINITY AssemblyScript CDK

This is an experimental project to evaluate how AssemblyScript could be used as a CDK and should not be used for any production purposes.

## Examples

1. [Counter Example](https://github.com/rckprtr/as-dfinity-examples/tree/master/examples/counter)
1. [Todo Example](https://github.com/rckprtr/as-dfinity-examples/tree/master/examples/todo)
1. [Phonebook Web Example](https://github.com/rckprtr/as-dfinity-examples/tree/master/examples/phonebook)
## What is supported?

### DFINITY IC

|  | Command |
| --- | --- |
| :heavy_minus_sign: | `call_data_append` |
| :heavy_minus_sign: | `call_funds_add` |
| :heavy_minus_sign: | `call_new` |
| :heavy_minus_sign: | `call_perform` |
| ✅ | `canister_balance` |
| ✅ | `canister_self_copy` |
| ✅ | `canister_self_size` |
| ✅ | `canister_update` |
| ✅ | `canister_query` |
| ✅ | `canister_pre_upgrade` |
| ✅ | `canister_post_upgrade` |
| ✅ | `canister_query` |
| ✅ | `debug_print` |
| ✅ | `msg_arg_data_copy` |
| ✅ | `msg_arg_data_size` |
| ✅ | `msg_caller_copy` |
| ✅ | `msg_caller_size` |
| ✅ | `msg_funds_available` |
| :heavy_minus_sign: | `msg_funds_refunded` |
| :heavy_minus_sign: | `msg_funds_accept` |
| ✅ | `msg_reject_code` |
| ✅ | `msg_reject_msg_size` |
| ✅ | `msg_reject_msg_copy` |
| ✅ | `msg_reject` |
| ✅ | `msg_reply_data_append` |
| ✅ | `msg_reply` |
| ✅ | `trap` |
| ✅ | `stable_write` |
| ✅ | `stable_read` |
| ✅ | `stable_size` |
| ✅ | `stable_grow` |
| ✅ | `time` |

### DFINITY Primitives

|  | DFX Primitive | AS Primitive |
| --- | --- | --- |
| ✅ | `Null` | `null` |
| ✅ | `Bool` | `bool` |
| :heavy_minus_sign: | `Nat` | `u∞` |
| ✅ | `Nat8` | `u8` |
| ✅ | `Nat16` | `u16` |
| ✅ | `Nat32` | `u32` |
| ✅ | `Nat64` | `u64` |
| :heavy_minus_sign: | `Int` | `i∞` |
| ✅ | `Int8` | `i8` |
| ✅ | `Int16` | `i16` |
| ✅ | `Int32` | `i32` |
| ✅ | `Int64` | `i64` |
| ✅ | `Float32` | `f32` |
| ✅ | `Float32` | `f64` |
| ✅ | `Text` | `string` |
| :heavy_minus_sign: | `Reserved` | `N/A` |
| ✅ | `Empty` | `N/A` |

* For Int/Nat AS currently does not have an arbitrary length integer

### Candid Types
|  | DFX Types | AS Type |
| --- | --- | --- |
| ✅ | `Opt` | Return Only <> [Basic Types can't be nullable](https://www.assemblyscript.org/types.html#type-rules) |
| ✅ | `Vec` | `Array<Object> or Object[] (Supports Multi Dimensional) ` |
| ✅ | `Record` | `Models (No Cyclical Relationships)` |
| :heavy_minus_sign: | `Variant` | `TBD` |


* TBD Field Types, Reference Types, Method Types

## Limitations

### Int and Nat

In DFINITY Int and Nat are represented as arbitrary length signed/unsighed integers.  BigInt's are currently not supported by `cdk-as`.

## How does it work?

TBD

## Things I want to integrate.

* [visitor-as](https://github.com/willemneal/visitor-as) - For Encode/Decode
