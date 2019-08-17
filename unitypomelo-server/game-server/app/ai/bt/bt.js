var exp = module.exports;
exp.RES_SUCCESS=0;
exp.RES_FAIL=1;
exp.RES_WAIT=2;

exp.POLICY_FAIL_NO_ONE = 10;
exp.POLICY_FAIL_NO_ALL = 11;

exp.Node 		= require('./node');
exp.Composite 	= require('./composite');
exp.Condition 	= require('./condition');
exp.Decorator 	= require('./decorator');
exp.Sequence 	= require('./sequence');
exp.Parallel 	= require('./parallel');
exp.Select 		= require('./select');
exp.Loop 		= require('./loop');
exp.If 			= require('./if');